import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ResultsScreen from "@/screens/ResultsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLanguage } from "@/contexts/LanguageContext";

export type ResultsStackParamList = {
  Results: undefined;
};

const Stack = createNativeStackNavigator<ResultsStackParamList>();

export default function ResultsStackNavigator() {
  const screenOptions = useScreenOptions();
  const { t } = useLanguage();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          title: t.results,
        }}
      />
    </Stack.Navigator>
  );
}
