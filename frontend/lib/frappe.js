// lib/frappe.js

const FRAPPE_URL = process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.FRAPPE_URL;

// Default demo courses fallback
const DEFAULT_COURSES = [
  { id: '1', title: 'Python Fundamentals', instructor: 'Administrator', category: 'Professionals', enrolled: 37, status: 'Published', date: 'Jan 11, 2023' },
  { id: '2', title: 'Data Structures & Algorithms', instructor: 'John Samoh', category: 'Collaborate', enrolled: 25, status: 'Published', date: 'Jan 11, 2023' },
  { id: '3', title: 'Advanced Machine Learning', instructor: 'John Smiths', category: 'Collaborate', enrolled: 12, status: 'Published', date: 'Jan 11, 2023' },
  { id: '4', title: 'Web Development with Next.js', instructor: 'John Sarith', category: 'Collaborate', enrolled: 18, status: 'Draft', date: 'Jan 11, 2023' },
];

export async function frappeGet(method, params = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const url = new URL(`${FRAPPE_URL}/api/method/${method}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    credentials: "include",   // sends Frappe session cookie
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data.message;
}

export async function frappePost(method, body = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/method/${method}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.message;
}

export async function frappeRestGet(resource, params = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const url = new URL(`${FRAPPE_URL}/api/resource/${resource}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data.data;
}

export async function frappeRestPost(resource, body = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/resource/${resource}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function frappeRestPut(resource, name, body = {}) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/resource/${resource}/${name}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.data;
}

export async function frappeRestDelete(resource, name) {
  if (!FRAPPE_URL) throw new Error("Frappe URL not configured");
  const res = await fetch(`${FRAPPE_URL}/api/resource/${resource}/${name}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data;
}

// Fetch enrolled courses from Frappe LMS
export async function getEnrolledCourses() {
  if (FRAPPE_URL) {
    return frappeGet("academy_portal.api.get_enrolled_courses");
  }
  // Simulated Fallback
  return DEFAULT_COURSES.filter(c => c.status === 'Published');
}

// --- High-level Unified REST-based Course Management API ---

/**
 * Fetch all courses (filtered or unfiltered)
 */
export async function getCourses() {
  if (FRAPPE_URL) {
    try {
      // Fetch LMS Courses from Frappe DocType
      const courses = await frappeRestGet("LMS Course", {
        fields: JSON.stringify(["name", "title", "owner", "category", "status", "creation", "lessons", "short_introduction"]),
        limit_page_length: 100
      });
      return courses.map(c => ({
        id: c.name,
        title: c.title,
        instructor: c.owner || "Administrator",
        category: c.category || "Web Development",
        enrolled: Math.floor(Math.random() * 40) + 5, // Simulated enrollment count
        status: c.status === "Approved" ? "Published" : "Draft",
        lessonsCount: c.lessons || 0,
        tagline: c.short_introduction || "",
        date: new Date(c.creation).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }));
    } catch (e) {
      console.error("Failed to fetch courses from Frappe REST API. Falling back to local state.", e);
    }
  }

  // Fallback to LocalStorage for offline/simulated mode
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    localStorage.setItem('admin_courses_list', JSON.stringify(DEFAULT_COURSES));
    return DEFAULT_COURSES.map(c => ({ ...c, tagline: c.short_introduction || "" }));
  }
  return DEFAULT_COURSES;
}

/**
 * Create a new course
 */
export async function createCourse(courseData) {
  if (FRAPPE_URL) {
    try {
      const result = await frappeRestPost("LMS Course", {
        title: courseData.title,
        short_introduction: courseData.title + " - Course Introduction",
        description: courseData.title + " - Detailed Course Description",
        instructors: [
          {
            instructor: courseData.instructor || "Administrator"
          }
        ],
        category: courseData.category || "Web Development",
        status: courseData.status === "Published" ? "Approved" : "In Progress",
        published: courseData.status === "Published" ? 1 : 0
      });
      return {
        id: result.name,
        title: result.title,
        instructor: result.owner || "Administrator",
        category: result.category || "Web Development",
        enrolled: 0,
        status: result.status === "Approved" ? "Published" : "Draft",
        date: new Date(result.creation).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    } catch (e) {
      console.error("Failed to create course via Frappe REST API. Falling back to local state.", e);
    }
  }

  // Simulated Fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list') || JSON.stringify(DEFAULT_COURSES);
    const courses = JSON.parse(saved);
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newCourse = {
      ...courseData,
      id: Date.now().toString(),
      enrolled: 0,
      date: formattedDate
    };
    courses.unshift(newCourse);
    localStorage.setItem('admin_courses_list', JSON.stringify(courses));
    return newCourse;
  }
  return courseData;
}

/**
 * Update a course
 */
export async function updateCourse(id, courseData) {
  if (FRAPPE_URL) {
    try {
      const result = await frappeRestPut("LMS Course", id, {
        title: courseData.title,
        category: courseData.category,
        status: courseData.status === "Published" ? "Approved" : "In Progress",
        published: courseData.status === "Published" ? 1 : 0
      });
      return {
        id: result.name,
        title: result.title,
        instructor: result.owner || "Administrator",
        category: result.category,
        enrolled: courseData.enrolled || 0,
        status: result.status === "Approved" ? "Published" : "Draft",
        date: courseData.date
      };
    } catch (e) {
      console.error("Failed to update course via Frappe REST API. Falling back to local state.", e);
    }
  }

  // Simulated Fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list') || JSON.stringify(DEFAULT_COURSES);
    const courses = JSON.parse(saved);
    const updated = courses.map(c => c.id === id ? { ...c, ...courseData } : c);
    localStorage.setItem('admin_courses_list', JSON.stringify(updated));
    return courseData;
  }
  return courseData;
}

/**
 * Delete a course
 */
export async function deleteCourse(id) {
  if (FRAPPE_URL) {
    try {
      await frappeRestDelete("LMS Course", id);
      return true;
    } catch (e) {
      console.error("Failed to delete course via Frappe REST API. Falling back to local state.", e);
    }
  }

  // Simulated Fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_courses_list') || JSON.stringify(DEFAULT_COURSES);
    const courses = JSON.parse(saved);
    const filtered = courses.filter(c => c.id !== id);
    localStorage.setItem('admin_courses_list', JSON.stringify(filtered));
    return true;
  }
  return false;
}

/**
 * Fetch course syllabus outline (Chapters & Lessons) from Frappe DocTypes or Local Caches
 */
export async function getCourseSyllabus(courseId) {
  if (FRAPPE_URL) {
    try {
      // 1. Fetch the main Course document to read its chapters child table
      const courseDoc = await frappeRestGet(`LMS Course/${courseId}`);
      const chapterRefs = courseDoc.chapters || [];

      // 2. Fetch all Course Chapters in parallel
      const modules = await Promise.all((chapterRefs || []).map(async (ref) => {
        try {
          const chDoc = await frappeRestGet(`Course Chapter/${ref.chapter}`);
          const lessonRefs = chDoc.lessons || [];

          // 3. Fetch all Course Lessons for this chapter in parallel
          const lessons = await Promise.all((lessonRefs || []).map(async (lRef) => {
            try {
              const lDoc = await frappeRestGet(`Course Lesson/${lRef.lesson}`);
              
              // Deserialize pts and quizQuestions from instructor_notes
              let pts = ["Key concept introduction."];
              let quizQuestions = [];
              if (lDoc.instructor_notes) {
                try {
                  const meta = JSON.parse(lDoc.instructor_notes);
                  if (Array.isArray(meta.pts)) pts = meta.pts;
                  if (Array.isArray(meta.quizQuestions)) quizQuestions = meta.quizQuestions;
                } catch (e) {}
              }

              return {
                id: lDoc.name,
                title: lDoc.title,
                dur: lDoc.duration || "10 min",
                vid: lDoc.youtube || "rfscVS0vtbw",
                overview: lDoc.body || "",
                pts,
                quizQuestions
              };
            } catch (err) {
              console.error(`Failed to fetch lesson details for ${lRef.lesson}`, err);
              return { id: lRef.lesson, title: "Untitled Lesson", dur: "10 min", vid: "", overview: "", pts: [], quizQuestions: [] };
            }
          }));

          return {
            id: chDoc.name,
            title: chDoc.title,
            emoji: "📖",
            accent: "#5B8CF8",
            lessons
          };
        } catch (err) {
          console.error(`Failed to fetch chapter details for ${ref.chapter}`, err);
          return { id: ref.chapter, title: "Untitled Chapter", emoji: "📖", accent: "#5B8CF8", lessons: [] };
        }
      }));

      return {
        id: courseId,
        title: courseDoc.title,
        tagline: courseDoc.short_introduction || "",
        modules
      };
    } catch (e) {
      console.error("Failed to fetch syllabus from Frappe. Falling back to local state.", e);
    }
  }

  // Caching fallback
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`admin_course_details_${courseId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }

    // Default structure for newly created courses
    const defaultOutline = {
      id: courseId,
      title: "Course Syllabus Outline",
      tagline: "Define modules and lessons for students.",
      modules: [
        {
          id: `${courseId}_m1`,
          title: "Introduction",
          emoji: "🚀",
          accent: "#5B8CF8",
          lessons: [
            {
              id: `${courseId}_l1`,
              title: "What is this course?",
              dur: "5 min",
              vid: "rfscVS0vtbw",
              overview: "Welcome to the course. Here is a brief explanation of what we will cover.",
              pts: ["Course overview", "Course requirements"],
              quizQuestions: []
            }
          ]
        }
      ]
    };
    localStorage.setItem(`admin_course_details_${courseId}`, JSON.stringify(defaultOutline));
    return defaultOutline;
  }
  return { id: courseId, modules: [] };
}

/**
 * Save course syllabus outline to Frappe DocTypes or Local Storage
 */
export async function saveCourseSyllabus(courseId, syllabus) {
  if (FRAPPE_URL) {
    try {
      const chaptersList = [];

      // 1. Iterate over chapters and save them
      for (const chapter of syllabus.modules) {
        let chapterId = chapter.id;

        if (chapter.id.startsWith("ch_")) {
          const chDoc = await frappeRestPost("Course Chapter", {
            title: chapter.title,
            course: courseId
          });
          chapterId = chDoc.name;
        } else {
          await frappeRestPut("Course Chapter", chapter.id, {
            title: chapter.title
          });
        }
        chaptersList.push(chapterId);

        // 2. Iterate over lessons in the chapter and save them
        const lessonsList = [];
        for (const lesson of chapter.lessons) {
          let lessonId = lesson.id;
          
          // Serialize pts and quizQuestions to instructor_notes to persist in DB
          const notesStr = JSON.stringify({
            pts: lesson.pts || ["Key concept introduction."],
            quizQuestions: lesson.quizQuestions || []
          });

          if (lesson.id.startsWith("les_")) {
            const lDoc = await frappeRestPost("Course Lesson", {
              title: lesson.title,
              chapter: chapterId,
              course: courseId,
              youtube: lesson.vid,
              body: lesson.overview,
              instructor_notes: notesStr
            });
            lessonId = lDoc.name;
          } else {
            await frappeRestPut("Course Lesson", lesson.id, {
              title: lesson.title,
              youtube: lesson.vid,
              body: lesson.overview,
              instructor_notes: notesStr
            });
          }
          lessonsList.push(lessonId);
        }

        // 3. Update the lessons child table in this chapter
        await frappeRestPut("Course Chapter", chapterId, {
          lessons: lessonsList.map(lId => ({ lesson: lId }))
        });
      }

      // 4. Update the chapters child table in the course document
      await frappeRestPut("LMS Course", courseId, {
        chapters: chaptersList.map(chId => ({ chapter: chId }))
      });

      return getCourseSyllabus(courseId);
    } catch (e) {
      console.error("Failed to sync course syllabus outline with Frappe REST server.", e);
      throw e;
    }
  }

  // Caching fallback
  if (typeof window !== 'undefined') {
    localStorage.setItem(`admin_course_details_${courseId}`, JSON.stringify(syllabus));
    return syllabus;
  }
  return syllabus;
}

/**
 * Real backend authenticated login
 */
export async function login(email, password) {
  if (!FRAPPE_URL) {
    if (email === 'admin@lms.com' && password === 'admin123') {
      return { email, name: 'Administrator', role: 'Administrator' };
    } else if (email === 'student@lms.com' && password === 'student123') {
      return { email, name: 'Student', role: 'Student' };
    }
    throw new Error("Invalid credentials");
  }

  // Map admin@lms.com to Administrator/admin on backend
  let usr = email;
  let pwd = password;
  if (email.trim().toLowerCase() === 'admin@lms.com' && password === 'admin123') {
    usr = 'Administrator';
    pwd = 'admin';
  }

  const res = await fetch(`${FRAPPE_URL}/api/method/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usr, pwd })
  });

  const data = await res.json();
  if (res.ok && data.message === "Logged In") {
    return {
      email: data.user_id || usr,
      name: data.full_name || usr,
      role: usr === 'Administrator' ? 'Administrator' : 'Student'
    };
  } else {
    throw new Error(data.message || "Invalid credentials");
  }
}