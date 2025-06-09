-- Create indexes for better performance

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Courses indexes
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_code ON public.courses(code);
CREATE INDEX idx_courses_enrollment_code ON public.courses(enrollment_code);
CREATE INDEX idx_courses_archived ON public.courses(is_archived);

-- Course enrollments indexes
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_enrolled_at ON public.course_enrollments(enrolled_at);

-- Assignments indexes
CREATE INDEX idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX idx_assignments_created_by ON public.assignments(created_by);
CREATE INDEX idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX idx_assignments_status ON public.assignments(status);

-- Submissions indexes
CREATE INDEX idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitted_at ON public.submissions(submitted_at);

-- Resources indexes
CREATE INDEX idx_resources_course_id ON public.resources(course_id);
CREATE INDEX idx_resources_added_by ON public.resources(added_by);
CREATE INDEX idx_resources_type ON public.resources(type);
CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_visible ON public.resources(is_visible);
CREATE INDEX idx_resources_pinned ON public.resources(is_pinned);

-- Resource comments indexes
CREATE INDEX idx_resource_comments_resource_id ON public.resource_comments(resource_id);
CREATE INDEX idx_resource_comments_user_id ON public.resource_comments(user_id);

-- Discussions indexes
CREATE INDEX idx_discussions_course_id ON public.discussions(course_id);
CREATE INDEX idx_discussions_author_id ON public.discussions(author_id);
CREATE INDEX idx_discussions_pinned ON public.discussions(is_pinned);
CREATE INDEX idx_discussions_locked ON public.discussions(is_locked);

-- Discussion replies indexes
CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_author_id ON public.discussion_replies(author_id);

-- Announcements indexes
CREATE INDEX idx_announcements_course_id ON public.announcements(course_id);
CREATE INDEX idx_announcements_author_id ON public.announcements(author_id);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at);

-- Course links indexes
CREATE INDEX idx_course_links_course_id ON public.course_links(course_id);
CREATE INDEX idx_course_links_token ON public.course_links(token);
CREATE INDEX idx_course_links_active ON public.course_links(is_active);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_type ON public.activities(type);
CREATE INDEX idx_activities_created_at ON public.activities(created_at);

-- Reports indexes
CREATE INDEX idx_reports_reported_by ON public.reports(reported_by);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_type ON public.reports(type);
