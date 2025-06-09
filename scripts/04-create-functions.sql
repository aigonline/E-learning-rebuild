-- Function to get user courses with additional info
CREATE OR REPLACE FUNCTION get_user_courses(user_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    code TEXT,
    description TEXT,
    color TEXT,
    instructor_name TEXT,
    student_count BIGINT,
    is_instructor BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.code,
        c.description,
        c.color,
        CONCAT(p.first_name, ' ', p.last_name) as instructor_name,
        (SELECT COUNT(*) FROM course_enrollments WHERE course_id = c.id) as student_count,
        (c.instructor_id = user_id) as is_instructor
    FROM courses c
    JOIN profiles p ON c.instructor_id = p.id
    WHERE c.instructor_id = user_id 
       OR c.id IN (SELECT course_id FROM course_enrollments WHERE student_id = user_id)
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student performance
CREATE OR REPLACE FUNCTION get_student_performance(student_id UUID)
RETURNS TABLE (
    total_assignments BIGINT,
    completed_assignments BIGINT,
    average_grade NUMERIC,
    on_time_submissions BIGINT,
    late_submissions BIGINT,
    missed_assignments BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(a.id) as total_assignments,
        COUNT(s.id) as completed_assignments,
        COALESCE(AVG(s.grade_score), 0) as average_grade,
        COUNT(CASE WHEN s.submitted_at <= a.due_date THEN 1 END) as on_time_submissions,
        COUNT(CASE WHEN s.submitted_at > a.due_date THEN 1 END) as late_submissions,
        COUNT(a.id) - COUNT(s.id) as missed_assignments
    FROM assignments a
    JOIN course_enrollments ce ON a.course_id = ce.course_id
    LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = student_id
    WHERE ce.student_id = student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get instructor stats
CREATE OR REPLACE FUNCTION get_instructor_stats(instructor_id UUID)
RETURNS TABLE (
    total_courses BIGINT,
    total_students BIGINT,
    total_assignments BIGINT,
    total_resources BIGINT,
    average_student_grade NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT ce.student_id) as total_students,
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT r.id) as total_resources,
        COALESCE(AVG(s.grade_score), 0) as average_student_grade
    FROM courses c
    LEFT JOIN course_enrollments ce ON c.id = ce.course_id
    LEFT JOIN assignments a ON c.id = a.course_id
    LEFT JOIN resources r ON c.id = r.course_id
    LEFT JOIN submissions s ON a.id = s.assignment_id
    WHERE c.instructor_id = instructor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_comments_updated_at BEFORE UPDATE ON public.resource_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON public.discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON public.discussion_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
