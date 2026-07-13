// --- 📄 STATIC COMPREHENSIVE EXAM DATA PLATFORM ---
// NOTE: kept for reference/offline demo purposes only. The live "Take Exam"
// flow (main.jsx -> take-exam.jsx) now always fetches real exam data from
// the backend by ID, so exams created in the Admin panel actually show up
// for students. This file is no longer imported by the exam-taking flow.
export const staticExams = [
  {
    _id: "6a50702a75524552a17ce5c1", // Hardcoded Token ID
    title: "Java Foundations Quiz",
    questions: [
      {
        text: "Which keyword is used to create a subclass inheritance in Java?",
        optionA: "extends",
        optionB: "implements",
        optionC: "inherits",
        optionD: "includes",
        correct: "A"
      },
      {
        text: "What is the default value of a local object variable instance in Java?",
        optionA: "null",
        optionB: "0",
        optionC: "undefined",
        optionD: "No default value (Must be initialized manually)",
        correct: "D"
      }
    ]
  },
  {
    _id: "7b61813b86635663b28df6d2",
    title: "Web Architecture Basics",
    questions: [
      {
        text: "What does HTTP status code 403 represent?",
        optionA: "Not Found",
        optionB: "Unauthorized/Forbidden Access",
        optionC: "Internal Server Error",
        optionD: "Bad Request Routing",
        correct: "B"
      }
    ]
  }
];
