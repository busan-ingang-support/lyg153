import { Hono } from 'hono';
import type { CloudflareBindings } from '../types';

const studentReport = new Hono<{ Bindings: CloudflareBindings }>();

// 생활기록부 조회
studentReport.get('/life-record/:student_id', async (c) => {
  try {
    const db = c.env.DB;
    const studentId = c.req.param('student_id');
    const { semester_id } = c.req.query();
    
    // 학생 기본 정보
    const student = await db.prepare(`
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).bind(studentId).first();
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // 학기 필터
    let semesterFilter = '';
    const params: any[] = [studentId];
    
    if (semester_id) {
      semesterFilter = ' AND sem.id = ?';
      params.push(semester_id);
    }
    
    // 반 배정 이력 (학기별)
    const classHistory = await db.prepare(`
      SELECT 
        sch.*,
        c.name as class_name,
        c.grade,
        sem.name as semester_name,
        sem.year,
        sem.semester,
        u.name as homeroom_teacher_name
      FROM student_class_history sch
      JOIN classes c ON sch.class_id = c.id
      JOIN semesters sem ON sch.semester_id = sem.id
      LEFT JOIN teacher_homeroom th ON th.class_id = c.id AND th.semester_id = sem.id
      LEFT JOIN teachers t ON th.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE sch.student_id = ?${semesterFilter}
      ORDER BY sem.year DESC, sem.semester DESC
    `).bind(...params).all();
    
    // 출석 통계 (학기별)
    const attendanceStats = await db.prepare(`
      SELECT 
        sem.id as semester_id,
        sem.name as semester_name,
        COUNT(*) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_days
      FROM attendance a
      JOIN enrollments e ON a.enrollment_id = e.id
      JOIN courses co ON e.course_id = co.id
      JOIN semesters sem ON co.semester_id = sem.id
      WHERE e.student_id = ?${semesterFilter}
      GROUP BY sem.id, sem.name
    `).bind(...params).all();
    
    // 성적 정보 (학기별, 과목별)
    const grades = await db.prepare(`
      SELECT 
        sem.id as semester_id,
        sem.name as semester_name,
        sub.name as subject_name,
        co.course_name,
        fg.total_score,
        fg.letter_grade,
        fg.rank,
        fg.class_rank,
        fg.comment
      FROM final_grades fg
      JOIN enrollments e ON fg.enrollment_id = e.id
      JOIN courses co ON e.course_id = co.id
      JOIN subjects sub ON co.subject_id = sub.id
      JOIN semesters sem ON co.semester_id = sem.id
      WHERE e.student_id = ?${semesterFilter}
      ORDER BY sem.year DESC, sem.semester DESC, sub.name
    `).bind(...params).all();
    
    // 봉사활동 (학기별)
    const volunteerActivities = await db.prepare(`
      SELECT 
        va.*,
        u.name as approved_by_name
      FROM volunteer_activities va
      LEFT JOIN users u ON va.approved_by = u.id
      WHERE va.student_id = ?
      ORDER BY va.activity_date DESC
    `).bind(studentId).all();
    
    // 동아리 활동
    const clubActivities = await db.prepare(`
      SELECT 
        cl.name as club_name,
        cl.description,
        cm.role,
        cm.joined_date,
        sem.name as semester_name
      FROM club_members cm
      JOIN clubs cl ON cm.club_id = cl.id
      JOIN semesters sem ON cl.semester_id = sem.id
      WHERE cm.student_id = ?${semesterFilter}
      ORDER BY cm.joined_date DESC
    `).bind(...params).all();
    
    // 생활기록부 특별 기록
    const specialRecords = await db.prepare(`
      SELECT 
        sr.*,
        sem.name as semester_name,
        u.name as recorded_by_name
      FROM student_records sr
      JOIN semesters sem ON sr.semester_id = sem.id
      LEFT JOIN users u ON sr.recorded_by = u.id
      WHERE sr.student_id = ?${semesterFilter}
      ORDER BY sr.record_date DESC
    `).bind(...params).all();
    
    // 상담 내역
    const counselingRecords = await db.prepare(`
      SELECT 
        cr.*,
        u.name as counselor_name
      FROM counseling_records cr
      LEFT JOIN users u ON cr.counselor_id = u.id
      WHERE cr.student_id = ?
      ORDER BY cr.counseling_date DESC
      LIMIT 50
    `).bind(studentId).all();
    
    return c.json({
      student,
      classHistory: classHistory.results,
      attendanceStats: attendanceStats.results,
      grades: grades.results,
      volunteerActivities: volunteerActivities.results,
      clubActivities: clubActivities.results,
      specialRecords: specialRecords.results,
      counselingRecords: counselingRecords.results
    });
  } catch (error) {
    console.error('Get life record error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 성적표 조회
studentReport.get('/grade-report/:student_id', async (c) => {
  try {
    const db = c.env.DB;
    const studentId = c.req.param('student_id');
    const { semester_id } = c.req.query();
    
    if (!semester_id) {
      return c.json({ error: 'semester_id is required' }, 400);
    }
    
    // 학생 기본 정보
    const student = await db.prepare(`
      SELECT 
        s.*,
        u.name,
        u.email,
        u.phone,
        c.name as class_name,
        c.grade
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_class_history sch ON s.id = sch.student_id AND sch.semester_id = ? AND sch.is_active = 1
      LEFT JOIN classes c ON sch.class_id = c.id
      WHERE s.id = ?
    `).bind(semester_id, studentId).first();
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // 학기 정보
    const semester = await db.prepare(`
      SELECT * FROM semesters WHERE id = ?
    `).bind(semester_id).first();
    
    // 과목별 성적
    const subjectGrades = await db.prepare(`
      SELECT 
        sub.name as subject_name,
        sub.code as subject_code,
        sub.credits,
        co.course_name,
        fg.total_score,
        fg.letter_grade,
        fg.rank,
        fg.class_rank,
        fg.attendance_score,
        fg.participation_score,
        fg.comment,
        u.name as teacher_name
      FROM enrollments e
      JOIN courses co ON e.course_id = co.id
      JOIN subjects sub ON co.subject_id = sub.id
      JOIN semesters sem ON co.semester_id = sem.id
      LEFT JOIN final_grades fg ON e.id = fg.enrollment_id
      LEFT JOIN teachers t ON co.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE e.student_id = ? AND sem.id = ?
      ORDER BY sub.subject_type, sub.name
    `).bind(studentId, semester_id).all();
    
    // 세부 성적 (시험별)
    const detailedGrades = await db.prepare(`
      SELECT 
        sub.name as subject_name,
        g.exam_type,
        g.score,
        g.max_score,
        g.weight,
        g.exam_date,
        g.note
      FROM grades g
      JOIN enrollments e ON g.enrollment_id = e.id
      JOIN courses co ON e.course_id = co.id
      JOIN subjects sub ON co.subject_id = sub.id
      JOIN semesters sem ON co.semester_id = sem.id
      WHERE e.student_id = ? AND sem.id = ?
      ORDER BY sub.name, g.exam_date
    `).bind(studentId, semester_id).all();
    
    // 출석 통계
    const attendanceStats = await db.prepare(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_days
      FROM attendance a
      JOIN enrollments e ON a.enrollment_id = e.id
      JOIN courses co ON e.course_id = co.id
      WHERE e.student_id = ? AND co.semester_id = ?
    `).bind(studentId, semester_id).first();
    
    // 종합 평균 계산
    const gradeResults = subjectGrades.results as any[];
    const totalCredits = gradeResults.reduce((sum, g) => sum + (g.credits || 0), 0);
    const weightedSum = gradeResults.reduce((sum, g) => {
      return sum + ((g.total_score || 0) * (g.credits || 0));
    }, 0);
    const averageScore = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
    
    return c.json({
      student,
      semester,
      subjectGrades: gradeResults,
      detailedGrades: detailedGrades.results,
      attendanceStats,
      summary: {
        totalCredits,
        averageScore,
        attendanceRate: attendanceStats?.total_days 
          ? ((attendanceStats.present_days / attendanceStats.total_days) * 100).toFixed(1)
          : '0.0'
      }
    });
  } catch (error) {
    console.error('Get grade report error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default studentReport;
