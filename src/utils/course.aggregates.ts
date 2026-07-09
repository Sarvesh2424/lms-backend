export function computeCourseAggregates(syllabus: any[] = []) {
  let totalCourseMins = 0;
  let totalLessons = 0;

  const normalizedSyllabus = syllabus.map((mod, moduleIndex) => {
    const moduleMins = (mod.lessons ?? []).reduce(
      (sum: number, lesson: any) => sum + (lesson.durationMins ?? 0),
      0,
    );
    totalCourseMins += moduleMins;
    totalLessons += (mod.lessons ?? []).length;

    return {
      ...mod,
      order: mod.order ?? moduleIndex,
      durationMins: moduleMins,
      lessons: (mod.lessons ?? []).map((lesson: any, lessonIndex: number) => ({
        ...lesson,
        order: lesson.order ?? lessonIndex,
      })),
    };
  });

  return {
    syllabus: normalizedSyllabus,
    durationHrs: Math.round((totalCourseMins / 60) * 10) / 10,
    lessonsCount: totalLessons,
  };
}

export function getPublishChecklist(course: any) {
  const hasQuiz = (course.syllabus ?? []).some((mod: any) =>
    (mod.lessons ?? []).some((lesson: any) => lesson.type === "Quiz"),
  );

  return {
    basics: Boolean(course.title && course.description && course.category && course.level),
    thumbnail: Boolean(course.thumbnail),
    minLessons: (course.lessonsCount ?? 0) >= 5,
    quizConfigured: hasQuiz,
    pricingConfigured: course.isFree === true || (course.price?.amount ?? 0) > 0,
    seoDescription: Boolean(course.seoDescription && course.seoDescription.length >= 10),
  };
}

export function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}