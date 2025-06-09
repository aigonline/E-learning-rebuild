-- Insert sample data for development/testing

-- Sample instructor profile (you'll need to create this user in Supabase Auth first)
-- INSERT INTO public.profiles (id, email, first_name, last_name, role, bio)
-- VALUES (
--     'instructor-uuid-here', 
--     'instructor@example.com', 
--     'John', 
--     'Doe', 
--     'instructor',
--     'Experienced computer science instructor with 10+ years of teaching experience.'
-- );

-- Sample student profiles
-- INSERT INTO public.profiles (id, email, first_name, last_name, role, bio)
-- VALUES 
--     ('student1-uuid-here', 'student1@example.com', 'Alice', 'Johnson', 'student', 'Computer science major interested in web development.'),
--     ('student2-uuid-here', 'student2@example.com', 'Bob', 'Smith', 'student', 'Software engineering student passionate about mobile apps.');

-- Sample courses
-- INSERT INTO public.courses (name, code, description, color, instructor_id)
-- VALUES 
--     ('Introduction to Web Development', 'CS101', 'Learn the fundamentals of HTML, CSS, and JavaScript', '#3B82F6', 'instructor-uuid-here'),
--     ('Advanced React Development', 'CS301', 'Deep dive into React, Next.js, and modern frontend development', '#10B981', 'instructor-uuid-here'),
--     ('Database Design and Management', 'CS201', 'Learn SQL, database design principles, and data modeling', '#F59E0B', 'instructor-uuid-here');

-- Sample course enrollments
-- INSERT INTO public.course_enrollments (course_id, student_id)
-- SELECT c.id, p.id
-- FROM public.courses c
-- CROSS JOIN public.profiles p
-- WHERE p.role = 'student'
-- AND c.code IN ('CS101', 'CS301');

-- Sample assignments
-- INSERT INTO public.assignments (title, description, instructions, points_possible, due_date, course_id, created_by)
-- SELECT 
--     'Build a Personal Website',
--     'Create a responsive personal website using HTML, CSS, and JavaScript',
--     'Your website should include: 1) A homepage with your bio, 2) A projects page, 3) A contact form, 4) Responsive design for mobile devices',
--     100,
--     NOW() + INTERVAL '2 weeks',
--     c.id,
--     c.instructor_id
-- FROM public.courses c
-- WHERE c.code = 'CS101';

-- Sample resources
-- INSERT INTO public.resources (title, description, type, category, content, course_id, added_by)
-- SELECT 
--     'HTML Basics Guide',
--     'Comprehensive guide to HTML fundamentals',
--     'text',
--     'lecture',
--     '# HTML Basics\n\nHTML (HyperText Markup Language) is the standard markup language for creating web pages...',
--     c.id,
--     c.instructor_id
-- FROM public.courses c
-- WHERE c.code = 'CS101';

-- Sample discussions
-- INSERT INTO public.discussions (title, content, course_id, author_id)
-- SELECT 
--     'Welcome to the Course!',
--     'Welcome everyone! Please introduce yourself and share what you hope to learn in this course.',
--     c.id,
--     c.instructor_id
-- FROM public.courses c
-- WHERE c.code = 'CS101';

-- Sample announcements
-- INSERT INTO public.announcements (title, content, course_id, author_id)
-- SELECT 
--     'Course Schedule Update',
--     'Please note that next week''s lecture has been moved to Thursday at 2 PM due to a scheduling conflict.',
--     c.id,
--     c.instructor_id
-- FROM public.courses c
-- WHERE c.code = 'CS101';
