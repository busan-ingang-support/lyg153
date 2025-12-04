// 과제 관리 (assignment-management.js)

// 과제 관리 메인 함수
async function showAssignmentManagement(container) {
    const isTeacher = currentUser && currentUser.role === 'teacher';
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
    
    container.innerHTML = `
        <div class="space-y-6">
            <!-- 헤더 -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">과제 관리</h1>
                    <p class="text-gray-500 text-sm mt-1">과제 생성, 채점 및 관리</p>
                </div>
                ${(isTeacher || isAdmin) ? `
                <button onclick="showAssignmentModal()" class="btn-pastel-primary px-4 py-2 rounded-lg font-medium">
                    <i class="fas fa-plus mr-2"></i>새 과제 등록
                </button>
                ` : ''}
            </div>
            
            <!-- 필터 영역 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">과목</label>
                        <select id="filter-course" class="input-modern w-full" onchange="loadAssignments()">
                            <option value="">전체 과목</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">상태</label>
                        <select id="filter-status" class="input-modern w-full" onchange="loadAssignments()">
                            <option value="">전체</option>
                            <option value="1">진행 중</option>
                            <option value="0">마감</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">공개 여부</label>
                        <select id="filter-published" class="input-modern w-full" onchange="loadAssignments()">
                            <option value="">전체</option>
                            <option value="1">공개</option>
                            <option value="0">비공개</option>
                        </select>
                    </div>
                    <div class="flex items-end">
                        <button onclick="loadAssignments()" class="btn-secondary w-full py-2 rounded-lg">
                            <i class="fas fa-search mr-2"></i>검색
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 과제 목록 -->
            <div id="assignments-container">
                <div class="text-center py-8">
                    <i class="fas fa-spinner fa-spin text-3xl text-gray-300"></i>
                    <p class="text-gray-500 mt-2">로딩 중...</p>
                </div>
            </div>
        </div>
        
        <!-- 과제 등록/수정 모달 -->
        <div id="assignment-modal" class="fixed inset-0 z-50 hidden">
            <div class="absolute inset-0 bg-black/50" onclick="closeAssignmentModal()"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="bg-white rounded-xl shadow-xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 id="assignment-modal-title" class="text-xl font-bold">새 과제 등록</h2>
                        <button onclick="closeAssignmentModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <form id="assignment-form" onsubmit="saveAssignment(event)">
                        <input type="hidden" id="assignment-id">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">과목 <span class="text-red-500">*</span></label>
                                <select id="assignment-course" class="input-modern w-full" required>
                                    <option value="">과목 선택</option>
                                </select>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">제목 <span class="text-red-500">*</span></label>
                                <input type="text" id="assignment-title" class="input-modern w-full" required>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">설명</label>
                                <textarea id="assignment-description" class="input-modern w-full" rows="4" placeholder="과제에 대한 설명을 입력하세요"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">과제 유형</label>
                                <select id="assignment-type" class="input-modern w-full">
                                    <option value="homework">숙제</option>
                                    <option value="project">프로젝트</option>
                                    <option value="report">보고서</option>
                                    <option value="practice">실습</option>
                                    <option value="other">기타</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">마감일</label>
                                <input type="datetime-local" id="assignment-due-date" class="input-modern w-full">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">최대 점수</label>
                                <input type="number" id="assignment-max-score" class="input-modern w-full" value="100" min="1">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">가중치</label>
                                <input type="number" id="assignment-weight" class="input-modern w-full" value="1.0" step="0.1" min="0.1">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">첨부 파일 URL</label>
                                <input type="url" id="assignment-file-url" class="input-modern w-full" placeholder="https://...">
                            </div>
                            <div class="md:col-span-2 space-y-3">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" id="assignment-published" class="w-4 h-4 text-blue-600 rounded">
                                    <span class="text-sm text-gray-700">즉시 공개</span>
                                </label>
                                <div id="notification-options" class="hidden pl-6 space-y-2">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="notify-students" class="w-4 h-4 text-blue-600 rounded" checked>
                                        <span class="text-sm text-gray-700">학생에게 알림 보내기</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" id="notify-parents" class="w-4 h-4 text-blue-600 rounded" checked>
                                        <span class="text-sm text-gray-700">학부모에게 알림 보내기</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-6">
                            <button type="button" onclick="closeAssignmentModal()" class="btn-secondary px-4 py-2 rounded-lg">
                                취소
                            </button>
                            <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
                                저장
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- 제출물 목록 모달 -->
        <div id="submissions-modal" class="fixed inset-0 z-50 hidden">
            <div class="absolute inset-0 bg-black/50" onclick="closeSubmissionsModal()"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div class="bg-white rounded-xl shadow-xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 id="submissions-modal-title" class="text-xl font-bold">제출물 관리</h2>
                        <button onclick="closeSubmissionsModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div id="submissions-container">
                        <div class="text-center py-8 text-gray-500">로딩 중...</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 채점 모달 -->
        <div id="grade-modal" class="fixed inset-0 z-[60] hidden">
            <div class="absolute inset-0 bg-black/50" onclick="closeGradeModal()"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
                <div class="bg-white rounded-xl shadow-xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold">채점</h2>
                        <button onclick="closeGradeModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <form id="grade-form" onsubmit="saveGrade(event)">
                        <input type="hidden" id="grade-assignment-id">
                        <input type="hidden" id="grade-submission-id">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">학생</label>
                                <p id="grade-student-name" class="text-lg font-medium"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">점수 <span class="text-red-500">*</span></label>
                                <div class="flex items-center gap-2">
                                    <input type="number" id="grade-score" class="input-modern w-32" required min="0">
                                    <span class="text-gray-500">/ <span id="grade-max-score">100</span></span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">피드백</label>
                                <textarea id="grade-feedback" class="input-modern w-full" rows="4" placeholder="학생에게 전달할 피드백을 입력하세요"></textarea>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-6">
                            <button type="button" onclick="closeGradeModal()" class="btn-secondary px-4 py-2 rounded-lg">
                                취소
                            </button>
                            <button type="submit" class="btn-pastel-primary px-6 py-2 rounded-lg">
                                저장
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // 공개 여부 체크박스 이벤트
    document.getElementById('assignment-published').addEventListener('change', function() {
        document.getElementById('notification-options').classList.toggle('hidden', !this.checked);
    });
    
    // 과목 목록 로드
    await loadCoursesForAssignment();
    
    // 과제 목록 로드
    await loadAssignments();
}

// 과목 목록 로드
async function loadCoursesForAssignment() {
    try {
        let url = '/api/courses';
        
        // 교사인 경우에만 본인이 담당하는 수업만 가져오기 (관리자는 전체)
        const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
        const isTeacher = currentUser && currentUser.role === 'teacher';
        
        if (isTeacher && !isAdmin && currentUser.teacher) {
            url += `?teacher_id=${currentUser.teacher.id}`;
        }
        
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const courses = response.data.courses || [];
        const filterSelect = document.getElementById('filter-course');
        const assignmentSelect = document.getElementById('assignment-course');
        
        if (courses.length === 0) {
            console.warn('수업이 없습니다. 먼저 과목 관리에서 수업을 개설하세요.');
        }
        
        const options = courses.map(c => `<option value="${c.id}">${c.course_name} (${c.subject_name || ''})</option>`).join('');
        
        if (filterSelect) {
            filterSelect.innerHTML = `<option value="">전체 과목</option>${options}`;
        }
        if (assignmentSelect) {
            assignmentSelect.innerHTML = `<option value="">과목 선택</option>${options}`;
        }
    } catch (error) {
        console.error('과목 로드 실패:', error);
    }
}

// 과제 목록 로드
async function loadAssignments() {
    const container = document.getElementById('assignments-container');
    const courseId = document.getElementById('filter-course')?.value;
    const isPublished = document.getElementById('filter-published')?.value;
    
    try {
        let url = '/api/assignments?';
        if (courseId) url += `course_id=${courseId}&`;
        if (isPublished !== '') url += `is_published=${isPublished}&`;
        
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const assignments = response.data.assignments || [];
        
        if (assignments.length === 0) {
            container.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <i class="fas fa-tasks text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">등록된 과제가 없습니다</p>
                </div>
            `;
            return;
        }
        
        const isTeacher = currentUser && currentUser.role === 'teacher';
        const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
        
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">과제명</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">과목</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">마감일</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">제출</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${assignments.map(a => {
                            const dueDate = a.due_date ? new Date(a.due_date) : null;
                            const isOverdue = dueDate && dueDate < new Date();
                            const typeLabels = {
                                homework: '숙제',
                                project: '프로젝트',
                                report: '보고서',
                                practice: '실습',
                                other: '기타'
                            };
                            
                            return `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-4">
                                    <div class="font-medium text-gray-800">${a.title}</div>
                                    ${a.description ? `<div class="text-sm text-gray-500 truncate max-w-xs">${a.description}</div>` : ''}
                                </td>
                                <td class="px-4 py-4 text-sm text-gray-600">${a.subject_name || a.course_name}</td>
                                <td class="px-4 py-4 text-sm text-gray-600">${typeLabels[a.assignment_type] || a.assignment_type}</td>
                                <td class="px-4 py-4 text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}">
                                    ${dueDate ? dueDate.toLocaleDateString('ko-KR') : '-'}
                                    ${isOverdue ? '<span class="text-xs">(마감)</span>' : ''}
                                </td>
                                <td class="px-4 py-4 text-center">
                                    <button onclick="showSubmissions(${a.id}, '${a.title}')" class="text-blue-600 hover:text-blue-800">
                                        ${a.submission_count || 0} / ${a.total_students || 0}
                                    </button>
                                </td>
                                <td class="px-4 py-4 text-center">
                                    ${a.is_published 
                                        ? '<span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">공개</span>' 
                                        : '<span class="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">비공개</span>'}
                                </td>
                                <td class="px-4 py-4 text-center">
                                    ${(isTeacher || isAdmin) ? `
                                    <div class="flex items-center justify-center gap-2">
                                        <button onclick="editAssignment(${a.id})" class="text-blue-600 hover:text-blue-800" title="수정">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button onclick="deleteAssignment(${a.id})" class="text-red-600 hover:text-red-800" title="삭제">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    ` : '-'}
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('과제 목록 로드 실패:', error);
        container.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                과제 목록을 불러오는데 실패했습니다.
            </div>
        `;
    }
}

// 과제 모달 표시
function showAssignmentModal(assignmentId = null) {
    const modal = document.getElementById('assignment-modal');
    const form = document.getElementById('assignment-form');
    const title = document.getElementById('assignment-modal-title');
    
    form.reset();
    document.getElementById('assignment-id').value = '';
    document.getElementById('notification-options').classList.add('hidden');
    
    if (assignmentId) {
        title.textContent = '과제 수정';
        loadAssignmentForEdit(assignmentId);
    } else {
        title.textContent = '새 과제 등록';
    }
    
    modal.classList.remove('hidden');
}

// 과제 모달 닫기
function closeAssignmentModal() {
    document.getElementById('assignment-modal').classList.add('hidden');
}

// 과제 수정용 데이터 로드
async function loadAssignmentForEdit(id) {
    try {
        const response = await axios.get(`/api/assignments/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const a = response.data.assignment;
        document.getElementById('assignment-id').value = a.id;
        document.getElementById('assignment-course').value = a.course_id;
        document.getElementById('assignment-title').value = a.title;
        document.getElementById('assignment-description').value = a.description || '';
        document.getElementById('assignment-type').value = a.assignment_type || 'homework';
        if (a.due_date) {
            document.getElementById('assignment-due-date').value = a.due_date.slice(0, 16);
        }
        document.getElementById('assignment-max-score').value = a.max_score || 100;
        document.getElementById('assignment-weight').value = a.weight || 1.0;
        document.getElementById('assignment-file-url').value = a.file_url || '';
        document.getElementById('assignment-published').checked = a.is_published === 1;
        
        if (a.is_published === 1) {
            document.getElementById('notification-options').classList.remove('hidden');
        }
    } catch (error) {
        console.error('과제 로드 실패:', error);
        alert('과제 정보를 불러오는데 실패했습니다.');
        closeAssignmentModal();
    }
}

// 과제 수정
function editAssignment(id) {
    showAssignmentModal(id);
}

// 과제 저장
async function saveAssignment(event) {
    event.preventDefault();
    
    const id = document.getElementById('assignment-id').value;
    const isPublished = document.getElementById('assignment-published').checked;
    
    const data = {
        course_id: Number(document.getElementById('assignment-course').value),
        title: document.getElementById('assignment-title').value,
        description: document.getElementById('assignment-description').value,
        assignment_type: document.getElementById('assignment-type').value,
        due_date: document.getElementById('assignment-due-date').value || null,
        max_score: Number(document.getElementById('assignment-max-score').value),
        weight: Number(document.getElementById('assignment-weight').value),
        file_url: document.getElementById('assignment-file-url').value || null,
        is_published: isPublished ? 1 : 0,
        notify_students: isPublished && document.getElementById('notify-students').checked,
        notify_parents: isPublished && document.getElementById('notify-parents').checked
    };
    
    try {
        if (id) {
            await axios.put(`/api/assignments/${id}`, data, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            alert('과제가 수정되었습니다.');
        } else {
            await axios.post('/api/assignments', data, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            alert('과제가 등록되었습니다.');
        }
        
        closeAssignmentModal();
        loadAssignments();
    } catch (error) {
        console.error('과제 저장 실패:', error);
        alert(error.response?.data?.error || '과제 저장에 실패했습니다.');
    }
}

// 과제 삭제
async function deleteAssignment(id) {
    if (!confirm('이 과제를 삭제하시겠습니까? 관련 제출물도 함께 삭제됩니다.')) return;
    
    try {
        await axios.delete(`/api/assignments/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        alert('과제가 삭제되었습니다.');
        loadAssignments();
    } catch (error) {
        console.error('과제 삭제 실패:', error);
        alert('과제 삭제에 실패했습니다.');
    }
}

// 제출물 목록 표시
async function showSubmissions(assignmentId, assignmentTitle) {
    const modal = document.getElementById('submissions-modal');
    const title = document.getElementById('submissions-modal-title');
    const container = document.getElementById('submissions-container');
    
    title.textContent = `제출물 - ${assignmentTitle}`;
    container.innerHTML = '<div class="text-center py-8 text-gray-500">로딩 중...</div>';
    modal.classList.remove('hidden');
    
    try {
        // 과제 정보 가져오기
        const assignmentRes = await axios.get(`/api/assignments/${assignmentId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        const assignment = assignmentRes.data.assignment;
        
        // 제출물 목록 가져오기
        const response = await axios.get(`/api/assignments/${assignmentId}/submissions`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const submissions = response.data.submissions || [];
        
        if (submissions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">제출된 과제가 없습니다</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">학번</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제출일시</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">점수</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${submissions.map(s => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm text-gray-600">${s.student_number || '-'}</td>
                                <td class="px-4 py-3 text-sm font-medium text-gray-800">${s.student_name}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">${new Date(s.submitted_at).toLocaleString('ko-KR')}</td>
                                <td class="px-4 py-3 text-center text-sm">
                                    ${s.score !== null ? `<span class="font-medium">${s.score}</span> / ${assignment.max_score}` : '-'}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    ${s.status === 2 
                                        ? '<span class="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">채점완료</span>'
                                        : '<span class="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">미채점</span>'}
                                </td>
                                <td class="px-4 py-3 text-center">
                                    <div class="flex items-center justify-center gap-2">
                                        ${s.content ? `<button onclick="viewSubmissionContent('${encodeURIComponent(s.content)}')" class="text-blue-600 hover:text-blue-800" title="내용 보기"><i class="fas fa-eye"></i></button>` : ''}
                                        ${s.file_url ? `<a href="${s.file_url}" target="_blank" class="text-green-600 hover:text-green-800" title="파일 다운로드"><i class="fas fa-download"></i></a>` : ''}
                                        <button onclick="showGradeModal(${assignmentId}, ${s.id}, '${s.student_name}', ${assignment.max_score}, ${s.score || 'null'}, '${s.feedback || ''}')" class="text-purple-600 hover:text-purple-800" title="채점">
                                            <i class="fas fa-pen"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('제출물 로드 실패:', error);
        container.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                제출물 목록을 불러오는데 실패했습니다.
            </div>
        `;
    }
}

// 제출물 모달 닫기
function closeSubmissionsModal() {
    document.getElementById('submissions-modal').classList.add('hidden');
}

// 제출물 내용 보기
function viewSubmissionContent(encodedContent) {
    const content = decodeURIComponent(encodedContent);
    alert(content);
}

// 채점 모달 표시
function showGradeModal(assignmentId, submissionId, studentName, maxScore, score, feedback) {
    document.getElementById('grade-assignment-id').value = assignmentId;
    document.getElementById('grade-submission-id').value = submissionId;
    document.getElementById('grade-student-name').textContent = studentName;
    document.getElementById('grade-max-score').textContent = maxScore;
    document.getElementById('grade-score').value = score !== null && score !== 'null' ? score : '';
    document.getElementById('grade-score').max = maxScore;
    document.getElementById('grade-feedback').value = feedback || '';
    
    document.getElementById('grade-modal').classList.remove('hidden');
}

// 채점 모달 닫기
function closeGradeModal() {
    document.getElementById('grade-modal').classList.add('hidden');
}

// 채점 저장
async function saveGrade(event) {
    event.preventDefault();
    
    const assignmentId = document.getElementById('grade-assignment-id').value;
    const submissionId = document.getElementById('grade-submission-id').value;
    const score = Number(document.getElementById('grade-score').value);
    const feedback = document.getElementById('grade-feedback').value;
    
    try {
        await axios.put(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
            score,
            feedback
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        alert('채점이 완료되었습니다.');
        closeGradeModal();
        
        // 제출물 목록 새로고침
        const title = document.getElementById('submissions-modal-title').textContent.replace('제출물 - ', '');
        showSubmissions(assignmentId, title);
    } catch (error) {
        console.error('채점 실패:', error);
        alert('채점에 실패했습니다.');
    }
}

