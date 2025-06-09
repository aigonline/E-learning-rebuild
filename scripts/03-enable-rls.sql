-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Anyone can view non-archived courses" ON public.courses FOR SELECT USING (NOT is_archived);
CREATE POLICY "Instructors can create courses" ON public.courses FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);
CREATE POLICY "Instructors can update own courses" ON public.courses FOR UPDATE USING (
    instructor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Instructors can delete own courses" ON public.courses FOR DELETE USING (
    instructor_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Course enrollments policies
CREATE POLICY "Users can view enrollments for their courses" ON public.course_enrollments FOR SELECT USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Students can enroll themselves" ON public.course_enrollments FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
);
CREATE POLICY "Students can unenroll themselves or instructors can remove students" ON public.course_enrollments FOR DELETE USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Assignments policies
CREATE POLICY "Users can view assignments for enrolled courses" ON public.assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = assignments.course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Instructors can create assignments for their courses" ON public.assignments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Instructors can update assignments for their courses" ON public.assignments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Instructors can delete assignments for their courses" ON public.assignments FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Submissions policies
CREATE POLICY "Users can view relevant submissions" ON public.submissions FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.assignments a 
        JOIN public.courses c ON a.course_id = c.id 
        WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Students can create submissions for their assignments" ON public.submissions FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.assignments a
        JOIN public.course_enrollments ce ON a.course_id = ce.course_id
        WHERE a.id = assignment_id AND ce.student_id = auth.uid()
    )
);
CREATE POLICY "Students can update own submissions, instructors can grade" ON public.submissions FOR UPDATE USING (
    student_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.assignments a 
        JOIN public.courses c ON a.course_id = c.id 
        WHERE a.id = assignment_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Resources policies
CREATE POLICY "Users can view visible resources for enrolled courses" ON public.resources FOR SELECT USING (
    (is_visible = true AND EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = resources.course_id AND student_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = resources.course_id AND instructor_id = auth.uid()) OR
    added_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Instructors can create resources for their courses" ON public.resources FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Resource creators and instructors can update resources" ON public.resources FOR UPDATE USING (
    added_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Resource creators and instructors can delete resources" ON public.resources FOR DELETE USING (
    added_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Resource comments policies
CREATE POLICY "Users can view comments for accessible resources" ON public.resource_comments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.resources r
        WHERE r.id = resource_id AND (
            (r.is_visible = true AND EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = r.course_id AND student_id = auth.uid())) OR
            EXISTS (SELECT 1 FROM public.courses WHERE id = r.course_id AND instructor_id = auth.uid()) OR
            r.added_by = auth.uid() OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
);
CREATE POLICY "Enrolled users can comment on resources" ON public.resource_comments FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.resources r
        JOIN public.course_enrollments ce ON r.course_id = ce.course_id
        WHERE r.id = resource_id AND ce.student_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.resources r
        JOIN public.courses c ON r.course_id = c.id
        WHERE r.id = resource_id AND c.instructor_id = auth.uid()
    )
);
CREATE POLICY "Users can update own comments" ON public.resource_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own comments or instructors can moderate" ON public.resource_comments FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.resources r
        JOIN public.courses c ON r.course_id = c.id
        WHERE r.id = resource_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Discussions policies
CREATE POLICY "Users can view discussions for enrolled courses" ON public.discussions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = discussions.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = discussions.course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Enrolled users can create discussions" ON public.discussions FOR INSERT WITH CHECK (
    author_id = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = discussions.course_id AND student_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.courses WHERE id = discussions.course_id AND instructor_id = auth.uid())
    )
);
CREATE POLICY "Authors and instructors can update discussions" ON public.discussions FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authors and instructors can delete discussions" ON public.discussions FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Discussion replies policies
CREATE POLICY "Users can view replies for accessible discussions" ON public.discussion_replies FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.discussions d
        WHERE d.id = discussion_id AND (
            EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = d.course_id AND student_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.courses WHERE id = d.course_id AND instructor_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
);
CREATE POLICY "Enrolled users can reply to discussions" ON public.discussion_replies FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.discussions d
        WHERE d.id = discussion_id AND (
            EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = d.course_id AND student_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.courses WHERE id = d.course_id AND instructor_id = auth.uid())
        )
    )
);
CREATE POLICY "Authors can update own replies" ON public.discussion_replies FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors and instructors can delete replies" ON public.discussion_replies FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.discussions d
        JOIN public.courses c ON d.course_id = c.id
        WHERE d.id = discussion_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Announcements policies
CREATE POLICY "Users can view announcements for enrolled courses" ON public.announcements FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = announcements.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = announcements.course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Instructors can create announcements for their courses" ON public.announcements FOR INSERT WITH CHECK (
    author_id = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
);
CREATE POLICY "Instructors can update announcements for their courses" ON public.announcements FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Instructors can delete announcements for their courses" ON public.announcements FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Course links policies
CREATE POLICY "Anyone can view active course links" ON public.course_links FOR SELECT USING (is_active = true);
CREATE POLICY "Instructors can create links for their courses" ON public.course_links FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (
        EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
);
CREATE POLICY "Instructors can update links for their courses" ON public.course_links FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activities policies
CREATE POLICY "Users can view own activities" ON public.activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert activities" ON public.activities FOR INSERT WITH CHECK (true);

-- Reports policies
CREATE POLICY "Users can view own reports and admins can view all" ON public.reports FOR SELECT USING (
    reported_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
