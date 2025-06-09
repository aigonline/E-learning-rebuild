-- Create modules table
CREATE TABLE public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    type TEXT DEFAULT 'text', -- 'text', 'video', 'quiz', 'assignment'
    duration_minutes INTEGER DEFAULT 0,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    video_url TEXT,
    file_data JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson progress table
CREATE TABLE public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false,
    progress_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lesson_id, student_id)
);

-- Create indexes
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_modules_order ON public.modules(order_index);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_lessons_order ON public.lessons(order_index);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_student_id ON public.lesson_progress(student_id);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules
CREATE POLICY "Users can view modules for enrolled courses" ON public.modules FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = modules.course_id AND student_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = modules.course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Instructors can manage modules for their courses" ON public.modules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = modules.course_id AND instructor_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons for enrolled courses" ON public.lessons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.course_enrollments ce ON m.course_id = ce.course_id
        WHERE m.id = lessons.module_id AND ce.student_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON m.course_id = c.id
        WHERE m.id = lessons.module_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Instructors can manage lessons for their courses" ON public.lessons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON m.course_id = c.id
        WHERE m.id = lessons.module_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for lesson progress
CREATE POLICY "Students can view own progress" ON public.lesson_progress FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.modules m ON l.module_id = m.id
        JOIN public.courses c ON m.course_id = c.id
        WHERE l.id = lesson_progress.lesson_id AND c.instructor_id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Students can update own progress" ON public.lesson_progress FOR INSERT WITH CHECK (
    student_id = auth.uid()
);

CREATE POLICY "Students can modify own progress" ON public.lesson_progress FOR UPDATE USING (
    student_id = auth.uid()
);

-- Add updated_at triggers
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
