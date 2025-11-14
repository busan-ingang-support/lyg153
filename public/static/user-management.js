// ============================================
// 사용자(교사) 관리 페이지
// ============================================

// 사용자 관리 메인 페이지
async function showUserManagement(container) {
    try {
        const response = await axios.get('/api/users?limit=1000', {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        const users = response.data.users;
        
        // 전역 변수에 저장
        window.allUsers = users;
        window.filteredUsers = users;
        
        container.innerHTML = `
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-8">사용자 관리</h1>
                
                <!-- 학생 등록 안내 -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-yellow-600 mr-3 mt-0.5"></i>
                        <div class="flex-1">
                            <h3 class="font-semibold text-yellow-900 mb-1">학생 등록 안내</h3>
                            <p class="text-sm text-yellow-800 mb-2">
                                학생 계정은 이 페이지에서 생성할 수 없습니다. 학생은 <strong>"학생 관리"</strong> 메뉴에서 등록해주세요.
                            </p>
                            <button onclick="navigateToPage('students')" class="text-sm bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 font-medium">
                                <i class="fas fa-user-graduate mr-2"></i>학생 관리로 이동
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold text-gray-700">관리자/교사/학부모 목록</h2>
                        <button onclick="navigateToPage('user-add')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            <i class="fas fa-plus mr-2"></i>사용자 추가
                        </button>
                    </div>
                    
                    <!-- 검색 및 필터 -->
                    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input type="text" 
                               id="user-search-input" 
                               placeholder="이름 또는 아이디 검색..."
                               class="px-4 py-2 border border-gray-300 rounded-lg"
                               oninput="filterUsers()">
                        
                        <select id="user-role-filter" 
                                class="px-4 py-2 border border-gray-300 rounded-lg"
                                onchange="filterUsers()">
                            <option value="">전체 권한</option>
                            <option value="super_admin">최고관리자</option>
                            <option value="admin">관리자</option>
                            <option value="teacher">교사</option>
                            <option value="parent">학부모</option>
                        </select>
                        
                        <button onclick="resetUserFilters()" 
                                class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                            <i class="fas fa-redo mr-2"></i>초기화
                        </button>
                    </div>
                    
                    <!-- 통계 카드 -->
                    <div id="user-stats" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    </div>
                    
                    <!-- 사용자 목록 테이블 -->
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">아이디</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">권한</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">작업</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200" id="users-tbody">
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="mt-4 text-sm text-gray-600">
                        총 <span id="user-count" class="font-bold text-blue-600">${users.length}</span>명
                    </div>
                </div>
            </div>
        `;
        
        renderUsersList();
    } catch (error) {
        console.error('Failed to load users:', error);
        alert('사용자 목록을 불러오는데 실패했습니다.');
    }
}

// 사용자 목록 렌더링
function renderUsersList() {
    const users = window.filteredUsers || window.allUsers || [];
    const tbody = document.getElementById('users-tbody');
    const countSpan = document.getElementById('user-count');
    
    if (countSpan) {
        countSpan.textContent = users.length;
    }
    
    // 통계 계산
    const stats = {
        total: users.length,
        super_admin: users.filter(u => u.role === 'super_admin').length,
        admin: users.filter(u => u.role === 'admin').length,
        teacher: users.filter(u => u.role === 'teacher').length,
        student: users.filter(u => u.role === 'student').length,
        parent: users.filter(u => u.role === 'parent').length
    };
    
    // 통계 카드 렌더링
    const statsContainer = document.getElementById('user-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="bg-purple-50 p-3 rounded-lg text-center">
                <p class="text-xs text-purple-600 mb-1">최고관리자</p>
                <p class="text-xl font-bold text-purple-800">${stats.super_admin}</p>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg text-center">
                <p class="text-xs text-blue-600 mb-1">관리자</p>
                <p class="text-xl font-bold text-blue-800">${stats.admin}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg text-center">
                <p class="text-xs text-green-600 mb-1">교사</p>
                <p class="text-xl font-bold text-green-800">${stats.teacher}</p>
            </div>
            <div class="bg-pink-50 p-3 rounded-lg text-center">
                <p class="text-xs text-pink-600 mb-1">학부모</p>
                <p class="text-xl font-bold text-pink-800">${stats.parent}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                <p class="text-xs text-gray-600 mb-1">학생 (참고)</p>
                <p class="text-xl font-bold text-gray-800">${stats.student}</p>
                <p class="text-xs text-gray-500 mt-1">학생관리에서</p>
            </div>
        `;
    }
    
    // 권한 레이블 색상
    const roleColors = {
        'super_admin': 'bg-purple-100 text-purple-800',
        'admin': 'bg-blue-100 text-blue-800',
        'teacher': 'bg-green-100 text-green-800',
        'student': 'bg-yellow-100 text-yellow-800',
        'parent': 'bg-pink-100 text-pink-800'
    };
    
    const roleLabels = {
        'super_admin': '최고관리자',
        'admin': '관리자',
        'teacher': '교사',
        'student': '학생',
        'parent': '학부모'
    };
    
    if (!tbody) return;
    
    tbody.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${user.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${user.username}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${user.email}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}">
                    ${roleLabels[user.role] || user.role}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                ${user.phone || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="changeUserRole(${user.id}, '${user.name}', '${user.role}')" class="text-purple-600 hover:text-purple-800 mr-3" title="권한 변경">
                    <i class="fas fa-user-shield"></i>
                </button>
                ${user.role !== 'super_admin' && user.role !== 'student' ? `
                    <button onclick="deleteUser(${user.id}, '${user.name}', '${user.role}')" class="text-red-600 hover:text-red-800" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : user.role === 'student' ? `
                    <span class="text-gray-400" title="학생은 학생 관리에서 삭제하세요">
                        <i class="fas fa-ban"></i>
                    </span>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// 사용자 필터링
function filterUsers() {
    const searchTerm = document.getElementById('user-search-input').value.toLowerCase();
    const roleFilter = document.getElementById('user-role-filter').value;
    
    let filtered = window.allUsers;
    
    // 검색어 필터
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.name.toLowerCase().includes(searchTerm) ||
            u.username.toLowerCase().includes(searchTerm)
        );
    }
    
    // 권한 필터
    if (roleFilter) {
        filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    window.filteredUsers = filtered;
    renderUsersList();
}

// 필터 초기화
function resetUserFilters() {
    document.getElementById('user-search-input').value = '';
    document.getElementById('user-role-filter').value = '';
    window.filteredUsers = window.allUsers;
    renderUsersList();
}

// 사용자 권한 변경
async function changeUserRole(userId, userName, currentRole) {
    // 학생 계정은 권한 변경 불가
    if (currentRole === 'student') {
        alert('학생 계정은 이 페이지에서 권한을 변경할 수 없습니다.\n\n학생 계정은 "학생 관리" 메뉴에서 관리해주세요.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'role-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">권한 변경</h2>
                <button onclick="closeRoleModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
            
            <div class="mb-4">
                <p class="text-sm text-gray-600">사용자: <span class="font-semibold">${userName}</span></p>
                <p class="text-sm text-gray-600">현재 권한: <span class="font-semibold">${getRoleLabel(currentRole)}</span></p>
            </div>
            
            <form id="change-role-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">새 권한 *</label>
                    <select name="role" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="super_admin" ${currentRole === 'super_admin' ? 'selected' : ''}>최고관리자</option>
                        <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>관리자</option>
                        <option value="teacher" ${currentRole === 'teacher' ? 'selected' : ''}>교사</option>
                        <option value="parent" ${currentRole === 'parent' ? 'selected' : ''}>학부모</option>
                    </select>
                    ${currentRole === 'student' ? `
                        <p class="text-xs text-red-600 mt-2">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            <strong>학생 계정은 권한 변경이 제한됩니다.</strong> 학생은 "학생 관리"에서 관리하세요.
                        </p>
                    ` : ''}
                </div>
                
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p class="text-xs text-yellow-800">
                        <i class="fas fa-exclamation-triangle mr-1"></i>
                        권한 변경 시 해당 사용자의 접근 권한이 즉시 변경됩니다.
                    </p>
                </div>
                
                <div class="flex justify-end space-x-4">
                    <button type="button" onclick="closeRoleModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        변경
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('change-role-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newRole = formData.get('role');
        
        try {
            await axios.put(`/api/users/${userId}/role`, {
                role: newRole
            }, {
                headers: { 'Authorization': 'Bearer ' + authToken }
            });
            
            alert('권한이 변경되었습니다.');
            closeRoleModal();
            navigateToPage('users');
        } catch (error) {
            console.error('권한 변경 실패:', error);
            alert('권한 변경에 실패했습니다: ' + (error.response?.data?.error || error.message));
        }
    });
}

function closeRoleModal() {
    const modal = document.getElementById('role-modal');
    if (modal) {
        modal.remove();
    }
}

function getRoleLabel(role) {
    const labels = {
        'super_admin': '최고관리자',
        'admin': '관리자',
        'teacher': '교사',
        'student': '학생',
        'parent': '학부모'
    };
    return labels[role] || role;
}

// 사용자 수정
async function editUser(userId) {
    window.currentEditUserId = userId;
    navigateToPage('user-edit');
}

// 사용자 삭제
async function deleteUser(userId, userName, userRole) {
    // 학생 계정은 삭제 불가
    if (userRole === 'student') {
        alert('학생 계정은 이 페이지에서 삭제할 수 없습니다.\n\n학생 계정은 "학생 관리" 메뉴에서 관리해주세요.');
        return;
    }
    
    if (!confirm(`정말로 ${userName} 사용자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    try {
        await axios.delete(`/api/users/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + authToken }
        });
        
        alert('사용자가 삭제되었습니다.');
        navigateToPage('users');
    } catch (error) {
        console.error('사용자 삭제 실패:', error);
        alert('사용자 삭제에 실패했습니다: ' + (error.response?.data?.error || error.message));
    }
}
