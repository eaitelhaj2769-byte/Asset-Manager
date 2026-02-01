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
          'Accept-Language': 'fr-FR,fr;q=0.9,ar;q=0.8,en-US;q=0.7,en;q=0.6',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
      });

      if (!response.ok) {
        console.log(`Response status: ${response.status}`);
        throw new Error(`Failed to fetch results: ${response.status}`);
      }

      const html = await response.text();
      console.log(`HTML length: ${html.length}`);
      
      const $ = cheerio.load(html);

      const studentName = extractStudentName($, html);
      const academicYear = extractAcademicYear(html) || getCurrentAcademicYear();
      const semester = extractSemester(html) || "Semestre";
      const subjects = extractSubjectsFromCards($, html);

      console.log(`Student name: ${studentName}`);
      console.log(`Academic year: ${academicYear}`);
      console.log(`Semester: ${semester}`);
      console.log(`Found ${subjects.length} subjects:`);
      subjects.forEach(s => console.log(`  - ${s.name}: ${s.grade} (${s.status})`));

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

function extractStudentName($: cheerio.CheerioAPI, html: string): string {
  const alertMatch = html.match(/<div class=['"]alert[^>]*>([^<]*N°Apogée[^<]*)<\/div>/i);
  if (alertMatch) {
    const text = alertMatch[1];
    const nameMatch = text.match(/Filière\s*:\s*[^\s]+\s*(?:<br\s*\/?>)?\s*(.+?)(?:\s*&nbsp;|\s*$)/i);
    if (nameMatch) {
      return nameMatch[1].trim().replace(/&nbsp;/g, ' ').trim();
    }
  }

  const alertDiv = $('.alert.alert-dark');
  if (alertDiv.length) {
    const text = alertDiv.text();
    const parts = text.split('Filière');
    if (parts.length > 1) {
      const afterFiliere = parts[1];
      const colonIndex = afterFiliere.indexOf(':');
      if (colonIndex !== -1) {
        const rest = afterFiliere.substring(colonIndex + 1).trim();
        const spaceParts = rest.split(/\s+/);
        if (spaceParts.length > 1) {
          return spaceParts.slice(1).join(' ').trim();
        }
      }
    }
  }

  const h5Match = html.match(/N°Apogée\s*:\s*\d+[^<]*Filière\s*:\s*[^\s<]+\s*(?:<br[^>]*>)?\s*([^<&]+)/i);
  if (h5Match) {
    return h5Match[1].trim();
  }

  return "Etudiant";
}

function extractAcademicYear(html: string): string | null {
  const yearPatterns = [
    /20\d{2}[-\/]20\d{2}/,
    /20\d{2}-20\d{2}/,
  ];
  
  for (const pattern of yearPatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

function extractSemester(html: string): string | null {
  const semesterPatterns = [
    /S\d+\.GR\d+/i,
    /Semestre\s*\d+/i,
    /S\d+/i,
  ];
  
  for (const pattern of semesterPatterns) {
    const match = html.match(pattern);
    if (match) {
      const semMatch = match[0].match(/S(\d+)/i);
      if (semMatch) {
        return `Semestre ${semMatch[1]}`;
      }
      return match[0];
    }
  }
  
  return null;
}

function extractSubjectsFromCards($: cheerio.CheerioAPI, html: string): Subject[] {
  const subjects: Subject[] = [];
  const seen = new Set<string>();

  $('.card.bg-light').each((_, card) => {
    const $card = $(card);
    
    const headerText = $card.find('.card-header b').text().trim();
    
    let subjectName = headerText;
    const prefixMatch = subjectName.match(/^S\d+\.GR\d+\s*/i);
    if (prefixMatch) {
      subjectName = subjectName.substring(prefixMatch[0].length).trim();
    }
    subjectName = subjectName.replace(/&nbsp;/g, ' ').trim();

    if (!subjectName || subjectName.length < 2 || seen.has(subjectName.toLowerCase())) {
      return;
    }
    seen.add(subjectName.toLowerCase());

    let grade: number | null = null;
    let status: Subject['status'] = 'V';

    const rows = $card.find('table tr');
    rows.each((_, row) => {
      const $row = $(row);
      const rowText = $row.text();
      
      if (rowText.includes('نتيجة الوحدة') || rowText.includes('résultat')) {
        const tds = $row.find('td');
        tds.each((_, td) => {
          const tdText = $(td).text().trim();
          const gradeMatch = tdText.match(/^(\d+(?:[.,]\d+)?)$/);
          if (gradeMatch) {
            grade = parseFloat(gradeMatch[1].replace(',', '.'));
          }
        });

        if ($row.hasClass('text-success') || rowText.includes('مستوفاة') || rowText.includes('validé')) {
          status = 'V';
        } else if ($row.hasClass('text-danger') || rowText.includes('غير مستوفاة') || rowText.includes('non validé')) {
          status = 'NV';
        }
      }
    });

    if (grade === null) {
      const cardText = $card.text();
      const gradeMatches = cardText.match(/(\d+(?:[.,]\d+)?)\s*\/20/g);
      if (gradeMatches && gradeMatches.length > 0) {
        const lastGradeMatch = gradeMatches[gradeMatches.length - 1].match(/(\d+(?:[.,]\d+)?)/);
        if (lastGradeMatch) {
          grade = parseFloat(lastGradeMatch[1].replace(',', '.'));
        }
      }
    }

    if (grade !== null) {
      status = grade >= 10 ? 'V' : 'NV';
    }

    subjects.push({
      name: subjectName,
      grade,
      status,
    });
  });

  if (subjects.length === 0) {
    const cardPattern = /<div class=['"]card bg-light[^>]*>[\s\S]*?<div class=['"]card-header['"]>([\s\S]*?)<\/div>[\s\S]*?<div class=['"]card-body['"]>([\s\S]*?)<\/div>/gi;
    let cardMatch;
    
    while ((cardMatch = cardPattern.exec(html)) !== null) {
      const header = cardMatch[1];
      const body = cardMatch[2];
      
      let subjectName = header.replace(/<[^>]*>/g, '').trim();
      const prefixMatch = subjectName.match(/^S\d+\.GR\d+\s*/i);
      if (prefixMatch) {
        subjectName = subjectName.substring(prefixMatch[0].length).trim();
      }
      subjectName = subjectName.replace(/&nbsp;/g, ' ').trim();

      if (!subjectName || subjectName.length < 2 || seen.has(subjectName.toLowerCase())) {
        continue;
      }
      seen.add(subjectName.toLowerCase());

      let grade: number | null = null;
      let status: Subject['status'] = 'V';

      const gradeMatches = body.match(/(\d+(?:[.,]\d+)?)\s*(?:<[^>]*>)*\s*\/20/g);
      if (gradeMatches && gradeMatches.length > 0) {
        const lastGradeStr = gradeMatches[gradeMatches.length - 1];
        const numMatch = lastGradeStr.match(/(\d+(?:[.,]\d+)?)/);
        if (numMatch) {
          grade = parseFloat(numMatch[1].replace(',', '.'));
        }
      }

      if (body.includes('text-success') || body.includes('مستوفاة')) {
        status = 'V';
      } else if (body.includes('text-danger') || body.includes('غير مستوفاة')) {
        status = 'NV';
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

  return subjects;
}

function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}
