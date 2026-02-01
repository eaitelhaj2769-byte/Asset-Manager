import type { Express } from "express";
import { createServer, type Server } from "node:http";
import * as cheerio from "cheerio";

interface Subject {
  name: string;
  grade: number | null;
  status: 'V' | 'NV' | 'AC' | 'ABJ' | 'ABI';
}

interface SemesterResult {
  id: string;
  studentId: string;
  studentName: string;
  semester: string;
  academicYear: string;
  subjects: Subject[];
  gpa: number;
  totalCredits: number;
  earnedCredits: number;
  fetchedAt: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/results/:studentId", async (req, res) => {
    const { studentId } = req.params;

    if (!studentId || studentId.length < 5) {
      return res.status(400).json({ 
        message: "Invalid student ID. Please enter a valid Apogee number." 
      });
    }

    try {
      const url = `https://e-apps.fsjes.uca.ma/scolarite/resultat/index.php?apogee=${studentId}`;
      
      console.log(`Fetching results from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        console.log(`Response status: ${response.status}`);
        throw new Error(`Failed to fetch results: ${response.status}`);
      }

      const html = await response.text();
      console.log(`HTML length: ${html.length}`);
      
      const $ = cheerio.load(html);

      const studentName = extractStudentName($, html) || `Etudiant ${studentId}`;
      const academicYear = extractAcademicYear($, html) || getCurrentAcademicYear();
      const semester = extractSemester($, html) || "Semestre 1";
      const subjects = extractSubjects($, html);

      console.log(`Found ${subjects.length} subjects`);
      console.log(`Student name: ${studentName}`);
      console.log(`Academic year: ${academicYear}`);
      console.log(`Semester: ${semester}`);

      const validGrades = subjects.filter(s => s.grade !== null);
      const gpa = validGrades.length > 0 
        ? parseFloat((validGrades.reduce((sum, s) => sum + (s.grade || 0), 0) / validGrades.length).toFixed(2))
        : 0;

      const result: SemesterResult = {
        id: `${studentId}-${academicYear}-${semester}`.replace(/\s+/g, '-'),
        studentId,
        studentName,
        semester,
        academicYear,
        subjects,
        gpa,
        totalCredits: subjects.length * 4,
        earnedCredits: subjects.filter(s => s.status === 'V' || s.status === 'AC').length * 4,
        fetchedAt: new Date().toISOString(),
      };

      res.json(result);
    } catch (error) {
      console.error("Error fetching results:", error);
      return res.status(500).json({ 
        message: "Unable to fetch results from the university server. Please try again later." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function extractStudentName($: cheerio.CheerioAPI, html: string): string | null {
  const patterns = [
    /<td[^>]*>.*?Nom.*?<\/td>\s*<td[^>]*>(.*?)<\/td>/is,
    /<td[^>]*>.*?Name.*?<\/td>\s*<td[^>]*>(.*?)<\/td>/is,
    /Nom\s*:\s*([^<\n]+)/i,
    /Etudiant\s*:\s*([^<\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const name = match[1].replace(/<[^>]*>/g, '').trim();
      if (name.length > 2) return name;
    }
  }

  const nameElement = $('td:contains("Nom")').next('td');
  if (nameElement.length) {
    const name = nameElement.text().trim();
    if (name.length > 2) return name;
  }

  const nameCell = $('th:contains("Nom")').parent().find('td');
  if (nameCell.length) {
    const name = nameCell.text().trim();
    if (name.length > 2) return name;
  }

  return null;
}

function extractAcademicYear($: cheerio.CheerioAPI, html: string): string | null {
  const yearPatterns = [
    /20\d{2}[-\/]20\d{2}/,
    /Année\s*(?:universitaire|scolaire)\s*:\s*(20\d{2}[-\/]20\d{2})/i,
  ];
  
  for (const pattern of yearPatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0].includes(':') ? match[1] : match[0];
    }
  }
  
  return null;
}

function extractSemester($: cheerio.CheerioAPI, html: string): string | null {
  const semesterPatterns = [
    /Semestre\s*\d+/i,
    /S\d+/i,
    /Semester\s*\d+/i,
    /الفصل\s*\d+/,
  ];
  
  for (const pattern of semesterPatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

function extractSubjects($: cheerio.CheerioAPI, html: string): Subject[] {
  const subjects: Subject[] = [];
  const seen = new Set<string>();

  $('table').each((_, table) => {
    $(table).find('tr').each((_, row) => {
      const cells = $(row).find('td');
      
      if (cells.length >= 2) {
        let subjectName = '';
        let gradeText = '';
        let statusText = '';

        if (cells.length >= 3) {
          subjectName = $(cells[0]).text().trim();
          gradeText = $(cells[1]).text().trim();
          statusText = $(cells[2]).text().trim();
        } else if (cells.length === 2) {
          subjectName = $(cells[0]).text().trim();
          gradeText = $(cells[1]).text().trim();
        }

        subjectName = subjectName.replace(/\s+/g, ' ').trim();

        if (subjectName.length > 3 && 
            !subjectName.toLowerCase().includes('module') &&
            !subjectName.toLowerCase().includes('matière') &&
            !subjectName.toLowerCase().includes('note') &&
            !subjectName.toLowerCase().includes('statut') &&
            !seen.has(subjectName.toLowerCase())) {
          
          seen.add(subjectName.toLowerCase());

          const gradeMatch = gradeText.match(/(\d+(?:[.,]\d+)?)/);
          let grade: number | null = null;
          
          if (gradeMatch) {
            grade = parseFloat(gradeMatch[1].replace(',', '.'));
            if (grade > 20 || grade < 0) grade = null;
          }

          let status: Subject['status'] = 'V';
          const statusUpper = statusText.toUpperCase();
          
          if (statusUpper.includes('NV') || statusUpper.includes('NON VALID')) {
            status = 'NV';
          } else if (statusUpper.includes('AC') || statusUpper.includes('ACQUIS')) {
            status = 'AC';
          } else if (statusUpper.includes('ABJ')) {
            status = 'ABJ';
          } else if (statusUpper.includes('ABI')) {
            status = 'ABI';
          } else if (grade !== null) {
            status = grade >= 10 ? 'V' : 'NV';
          }

          subjects.push({
            name: subjectName,
            grade,
            status,
          });
        }
      }
    });
  });

  const rowPattern = /<tr[^>]*>(.*?)<\/tr>/gis;
  const cellPattern = /<td[^>]*>(.*?)<\/td>/gis;
  let rowMatch;
  
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const rowContent = rowMatch[1];
    const cells: string[] = [];
    let cellMatch;
    
    const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
    }

    if (cells.length >= 2) {
      const subjectName = cells[0].replace(/\s+/g, ' ').trim();
      
      if (subjectName.length > 3 && 
          !subjectName.toLowerCase().includes('module') &&
          !subjectName.toLowerCase().includes('matière') &&
          !subjectName.toLowerCase().includes('note') &&
          !subjectName.toLowerCase().includes('statut') &&
          !seen.has(subjectName.toLowerCase())) {
        
        seen.add(subjectName.toLowerCase());

        const gradeMatch = cells[1]?.match(/(\d+(?:[.,]\d+)?)/);
        let grade: number | null = null;
        
        if (gradeMatch) {
          grade = parseFloat(gradeMatch[1].replace(',', '.'));
          if (grade > 20 || grade < 0) grade = null;
        }

        let status: Subject['status'] = 'V';
        const statusText = cells[2] || '';
        const statusUpper = statusText.toUpperCase();
        
        if (statusUpper.includes('NV')) {
          status = 'NV';
        } else if (statusUpper.includes('AC')) {
          status = 'AC';
        } else if (statusUpper.includes('ABJ')) {
          status = 'ABJ';
        } else if (statusUpper.includes('ABI')) {
          status = 'ABI';
        } else if (grade !== null) {
          status = grade >= 10 ? 'V' : 'NV';
        }

        subjects.push({
          name: subjectName,
          grade,
          status,
        });
      }
    }
  }

  return subjects;
}

function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (month >= 8) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
}
