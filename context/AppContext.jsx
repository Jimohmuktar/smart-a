import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "@/utils/storage";
import { sendQuestionAnsweredNotification, sendAdminMessageNotification } from "@/utils/notifications";

const AppContext = createContext(null);

const KEYS = {
  courses: "smart_a_courses",
  tasks: "smart_a_tasks",
  mentorSessions: "smart_a_mentor_sessions",
  enrolledSkills: "smart_a_enrolled_skills",
  quizScores: "smart_a_quiz_scores",
  bootcampClasses: "smart_a_bootcamp_classes",
  growthGoals: "smart_a_growth_goals",
  connections: "smart_a_connections",
  posts: "smart_a_posts",
  mentorApplications: "smart_a_mentor_applications",
  adminMessages: "smart_a_admin_messages",
  news: "smart_a_news",
};

export function AppProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [mentorSessions, setMentorSessions] = useState([]);
  const [enrolledSkills, setEnrolledSkills] = useState([]);
  const [quizScores, setQuizScores] = useState([]);
  const [bootcampClasses, setBootcampClasses] = useState([]);
  const [growthGoals, setGrowthGoals] = useState([]);
  const [connections, setConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [mentorApplications, setMentorApplications] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    (async () => {
      const [c, t, ms, es, qs, bc, gg, cn, p, ma, am, nw] = await Promise.all([
        storage.get(KEYS.courses),
        storage.get(KEYS.tasks),
        storage.get(KEYS.mentorSessions),
        storage.get(KEYS.enrolledSkills),
        storage.get(KEYS.quizScores),
        storage.get(KEYS.bootcampClasses),
        storage.get(KEYS.growthGoals),
        storage.get(KEYS.connections),
        storage.get(KEYS.posts),
        storage.get(KEYS.mentorApplications),
        storage.get(KEYS.adminMessages),
        storage.get(KEYS.news),
      ]);
      if (c) setCourses(c);
      if (t) setTasks(t);
      if (ms) setMentorSessions(ms);
      if (es) setEnrolledSkills(es);
      if (qs) setQuizScores(qs);
      if (bc) setBootcampClasses(bc);
      if (gg) setGrowthGoals(gg);
      if (cn) setConnections(cn);
      if (p) setPosts(p);
      if (ma) setMentorApplications(ma);
      if (am) setAdminMessages(am);
      if (nw) setNews(nw);
    })();
  }, []);

  const save = async (key, value, setter) => {
    await storage.set(key, value);
    setter(value);
  };

  const addCourse = async (course) => {
    const updated = [...courses, { ...course, id: Date.now().toString() }];
    await save(KEYS.courses, updated, setCourses);
  };
  const updateCourse = async (id, data) => {
    const updated = courses.map((c) => (c.id === id ? { ...c, ...data } : c));
    await save(KEYS.courses, updated, setCourses);
  };
  const deleteCourse = async (id) => {
    const updated = courses.filter((c) => c.id !== id);
    await save(KEYS.courses, updated, setCourses);
  };

  const addTask = async (task) => {
    const updated = [...tasks, { ...task, id: Date.now().toString(), completed: false }];
    await save(KEYS.tasks, updated, setTasks);
  };
  const toggleTask = async (id) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    await save(KEYS.tasks, updated, setTasks);
  };
  const deleteTask = async (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    await save(KEYS.tasks, updated, setTasks);
  };

  const createMentorSession = async (session) => {
    const updated = [...mentorSessions, { ...session, id: Date.now().toString(), messages: [], createdAt: new Date().toISOString() }];
    await save(KEYS.mentorSessions, updated, setMentorSessions);
    return updated[updated.length - 1];
  };
  const addMentorMessage = async (sessionId, message) => {
    const updated = mentorSessions.map((s) =>
      s.id === sessionId ? { ...s, messages: [...s.messages, { ...message, id: Date.now().toString(), timestamp: new Date().toISOString() }] } : s
    );
    await save(KEYS.mentorSessions, updated, setMentorSessions);
  };

  const enrollSkill = async (skillId) => {
    if (enrolledSkills.includes(skillId)) return;
    const updated = [...enrolledSkills, skillId];
    await save(KEYS.enrolledSkills, updated, setEnrolledSkills);
  };

  const addQuizScore = async (score) => {
    const updated = [...quizScores, { ...score, id: Date.now().toString(), date: new Date().toISOString() }];
    await save(KEYS.quizScores, updated, setQuizScores);
  };

  const addBootcampClass = async (cls) => {
    const updated = [...bootcampClasses, { ...cls, id: Date.now().toString(), files: [], questions: [], createdAt: new Date().toISOString() }];
    await save(KEYS.bootcampClasses, updated, setBootcampClasses);
  };
  const deleteBootcampClass = async (id) => {
    const updated = bootcampClasses.filter((c) => c.id !== id);
    await save(KEYS.bootcampClasses, updated, setBootcampClasses);
  };
  const updateBootcampClass = async (id, data) => {
    const updated = bootcampClasses.map((c) => (c.id === id ? { ...c, ...data } : c));
    await save(KEYS.bootcampClasses, updated, setBootcampClasses);
  };
  const addClassQuestion = async (classId, question) => {
    const updated = bootcampClasses.map((c) => {
      if (c.id !== classId) return c;
      const questions = [
        ...(c.questions || []),
        { ...question, id: Date.now().toString(), classId, createdAt: new Date().toISOString(), answered: false },
      ];
      return { ...c, questions };
    });
    await save(KEYS.bootcampClasses, updated, setBootcampClasses);
  };
  const answerClassQuestion = async (classId, questionId, answer) => {
    let answeredQuestion = null;
    const updated = bootcampClasses.map((c) => {
      if (c.id !== classId) return c;
      const questions = (c.questions || []).map((q) => {
        if (q.id === questionId) { answeredQuestion = q; return { ...q, answer, answered: true }; }
        return q;
      });
      return { ...c, questions };
    });
    await save(KEYS.bootcampClasses, updated, setBootcampClasses);
    if (answeredQuestion) await sendQuestionAnsweredNotification(answeredQuestion.studentName, answeredQuestion.question);
  };

  const addGrowthGoal = async (goal) => {
    const updated = [...growthGoals, { ...goal, id: Date.now().toString(), completed: false, createdAt: new Date().toISOString() }];
    await save(KEYS.growthGoals, updated, setGrowthGoals);
  };
  const toggleGrowthGoal = async (id) => {
    const updated = growthGoals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
    await save(KEYS.growthGoals, updated, setGrowthGoals);
  };

  const addPost = async (post) => {
    const updated = [{ ...post, id: Date.now().toString(), likes: 0, createdAt: new Date().toISOString() }, ...posts];
    await save(KEYS.posts, updated, setPosts);
  };
  const likePost = async (id) => {
    const updated = posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p));
    await save(KEYS.posts, updated, setPosts);
  };

  const applyAsMentor = async (application) => {
    const existing = mentorApplications.find((a) => a.userId === application.userId);
    if (existing) return;
    const updated = [...mentorApplications, { ...application, id: Date.now().toString(), status: "pending", createdAt: new Date().toISOString() }];
    await save(KEYS.mentorApplications, updated, setMentorApplications);
  };
  const updateMentorApplication = async (id, status) => {
    const updated = mentorApplications.map((a) => (a.id === id ? { ...a, status } : a));
    await save(KEYS.mentorApplications, updated, setMentorApplications);
  };

  const sendAdminMessage = async (message) => {
    const updated = [...adminMessages, { ...message, id: Date.now().toString(), createdAt: new Date().toISOString(), read: false }];
    await save(KEYS.adminMessages, updated, setAdminMessages);
    await sendAdminMessageNotification(message.title, message.body);
  };
  const markAdminMessageRead = async (id) => {
    const updated = adminMessages.map((m) => (m.id === id ? { ...m, read: true } : m));
    await save(KEYS.adminMessages, updated, setAdminMessages);
  };

  const addNews = async (item) => {
    const updated = [{ ...item, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...news];
    await save(KEYS.news, updated, setNews);
  };
  const deleteNews = async (id) => {
    const updated = news.filter((n) => n.id !== id);
    await save(KEYS.news, updated, setNews);
  };

  const calculateGPA = () => {
    if (!courses.length) return 0;
    const gradePoints = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
    let totalPoints = 0, totalUnits = 0;
    courses.forEach((c) => {
      const gp = gradePoints[c.grade?.toUpperCase()] ?? 0;
      totalPoints += gp * (c.units || 3);
      totalUnits += c.units || 3;
    });
    return totalUnits ? Math.round((totalPoints / totalUnits) * 100) / 100 : 0;
  };

  const classQuestions = bootcampClasses.flatMap((c) =>
    (c.questions || []).map((q) => ({ ...q, classId: c.id }))
  );

  return (
    <AppContext.Provider value={{
      courses, tasks, mentorSessions, enrolledSkills, quizScores, bootcampClasses, growthGoals, connections, posts, mentorApplications, adminMessages, news,
      classQuestions,
      addCourse, updateCourse, deleteCourse,
      addTask, toggleTask, deleteTask,
      createMentorSession, addMentorMessage,
      enrollSkill,
      addQuizScore,
      addBootcampClass, deleteBootcampClass, updateBootcampClass, addClassQuestion, answerClassQuestion,
      addGrowthGoal, toggleGrowthGoal,
      addPost, likePost,
      applyAsMentor, updateMentorApplication,
      sendAdminMessage, markAdminMessageRead,
      addNews, deleteNews,
      calculateGPA,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
