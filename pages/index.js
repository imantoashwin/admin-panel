// pages/index.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Users, 
  Sprout, 
  ShoppingCart, 
  TrendingUp, 
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from '../lib/firebase';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Google Translate initialization
  useEffect(() => {
    if (!isClient) return; // Only run on client side
    
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ta,hi,te,kn,ml,bn,gu,mr,or,ur",
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          autoDisplay: false,
          multilanguagePage: true,
        },
        "google_translate_element"
      );

      // Hide banner
      setTimeout(hideBanner, 500);
      setTimeout(hideBanner, 1500);
      
      // Add click functionality to custom button (desktop)
      setTimeout(() => {
        const customBtn = document.querySelector('.custom-translate-btn');
        const googleSelect = document.querySelector('.goog-te-combo');
        const translateContainer = document.querySelector('.translate-micro');
        
        if (customBtn && googleSelect && translateContainer) {
          let isOpen = false;
          
          customBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!isOpen) {
              translateContainer.classList.add('open');
              googleSelect.style.display = 'block';
              googleSelect.focus();
              googleSelect.click();
              isOpen = true;
            }
          });
          
          // Close dropdown when clicking outside
          document.addEventListener('click', (e) => {
            if (!translateContainer.contains(e.target)) {
              translateContainer.classList.remove('open');
              isOpen = false;
            }
          });
          
          // Handle dropdown change
          googleSelect.addEventListener('change', () => {
            translateContainer.classList.remove('open');
            isOpen = false;
          });
        }

        // Add click functionality for mobile translate button
        const mobileTranslateBtn = document.querySelector('.mobile-translate-btn');
        if (mobileTranslateBtn) {
          let customDropdown = null;
          
          mobileTranslateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const googleSelect = document.querySelector('.goog-te-combo');
            
            if (googleSelect) {
              // Check if dropdown already exists and remove it safely
              if (customDropdown && customDropdown.parentNode) {
                customDropdown.remove();
                customDropdown = null;
                return;
              } else if (customDropdown) {
                // Reset if dropdown reference exists but not in DOM
                customDropdown = null;
              }
              
              const rect = mobileTranslateBtn.getBoundingClientRect();
              
              customDropdown = document.createElement('div');
              customDropdown.className = 'custom-mobile-dropdown';
              customDropdown.style.cssText = `
                position: fixed;
                top: ${rect.bottom + 8}px;
                right: ${window.innerWidth - rect.right}px;
                z-index: 9999;
                background: white;
                border: 2px solid #004e16;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                padding: 8px 0;
                min-width: 160px;
                max-height: 250px;
                overflow-y: auto;
                animation: fadeInScale 0.2s ease-out;
              `;
              
              const options = googleSelect.querySelectorAll('option');
              options.forEach((option, index) => {
                if (index === 0) return;
                
                const optionDiv = document.createElement('div');
                optionDiv.textContent = option.textContent;
                optionDiv.style.cssText = `
                  padding: 12px 16px;
                  cursor: pointer;
                  font-size: 15px;
                  color: #333;
                  border-bottom: 1px solid #f0f0f0;
                  transition: all 0.2s ease;
                `;
                
                optionDiv.addEventListener('mouseenter', () => {
                  optionDiv.style.background = 'linear-gradient(135deg, #46b57f, #46b5a7)';
                  optionDiv.style.color = 'white';
                  optionDiv.style.transform = 'translateX(4px)';
                });
                
                optionDiv.addEventListener('mouseleave', () => {
                  optionDiv.style.background = 'white';
                  optionDiv.style.color = '#333';
                  optionDiv.style.transform = 'translateX(0)';
                });
                
                optionDiv.addEventListener('click', () => {
                  googleSelect.value = option.value;
                  
                  const changeEvent = new Event('change', { bubbles: true });
                  googleSelect.dispatchEvent(changeEvent);
                  
                  // Safe removal with null checks
                  if (customDropdown && customDropdown.parentNode) {
                    customDropdown.remove();
                  }
                  customDropdown = null;
                });
                
                customDropdown.appendChild(optionDiv);
              });
              
              document.body.appendChild(customDropdown);
              
              const handleClickOutside = (event) => {
                if (customDropdown && customDropdown.parentNode && !customDropdown.contains(event.target) && !mobileTranslateBtn.contains(event.target)) {
                  customDropdown.remove();
                  customDropdown = null;
                  document.removeEventListener('click', handleClickOutside);
                } else if (!customDropdown) {
                  document.removeEventListener('click', handleClickOutside);
                }
              };
              
              setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
              }, 100);
              
            } else {
              setTimeout(() => {
                mobileTranslateBtn.click();
              }, 500);
            }
          });
        }
      }, 1000);
    };

    const hideBanner = () => {
      const banner = document.querySelector(".goog-te-banner-frame");
      if (banner) banner.style.display = "none";
      document.body.style.top = "0px";
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isClient]);

  // Check authentication
  useEffect(() => {
    if (!isClient) return; // Only run on client side
    
    const checkAuth = () => {
      const adminLoggedIn = localStorage.getItem('adminLoggedIn');
      if (adminLoggedIn === 'true') {
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, isClient]);

  // Fetch users from Firebase
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const unsubscribe = onSnapshot(
          collection(db, 'users'), 
          (snapshot) => {
            const usersData = [];
            snapshot.forEach((doc) => {
              const userData = { uid: doc.id, ...doc.data() };
              
              if (userData.createdAt && userData.createdAt.toDate) {
                userData.createdAt = userData.createdAt.toDate().toISOString();
              }
              
              usersData.push(userData);
            });
            
            usersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setUsers(usersData);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please check your Firebase configuration.');
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up users listener:', error);
        setError('Failed to connect to Firebase. Please check your configuration.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    document.cookie = 'adminLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  // Show loading screen while checking authentication or during hydration
  if (!isClient || (!isAuthenticated && isClient)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
          <span className="text-gray-600">
            {!isClient ? 'Loading...' : 'Checking authentication...'}
          </span>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    farmers: users.filter(u => u.role === 'farmer').length,
    consumers: users.filter(u => u.role === 'consumer').length,
    recentSignups: users.filter(u => {
      const signupDate = new Date(u.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return signupDate > weekAgo;
    }).length
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phonenumber || '').includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const exportToCSV = () => {
    const headers = ['Username', 'Email', 'Role', 'Phone', 'Address', 'City', 'State', 'Country', 'Pincode', 'Created At'];
    const csvData = users.map(user => [
      user.username || '',
      user.email || '',
      user.role || '',
      user.phonenumber || '',
      `${user.addressline1 || ''} ${user.addressline2 || ''}`.trim(),
      user.city || '',
      user.state || '',
      user.country || '',
      user.pincode || '',
      formatDate(user.createdAt)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agriconnect-users-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Google Translate Elements */}
      <div className="translate-micro" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'none' }}>
        <div
          id="google_translate_element"
          className="translate-icon"
        ></div>
        <div className="custom-translate-btn" title="Translate">
          🌐
        </div>
      </div>

      {/* Mobile Translate Button */}
      <div className="mobile-translate-btn" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }} title="Translate">
        🌐
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Link href="https://agriconnectwebapp.netlify.app/" passHref>
                <div className="cursor-pointer">
                  <Image
                    src="/Images/Logo/Agriconnect_logo.png"
                    alt="AgriConnect Logo"
                    width={160}
                    height={80}
                    priority
                  />
                </div>
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefreshData}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                title="Refresh Data"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 text-sm"
                title="Logout"
              >
                Logout
              </button>
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Farmers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.farmers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consumers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.consumers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Week</p>
                <p className="text-3xl font-bold text-gray-900">{stats.recentSignups}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="farmer">Farmers</option>
                    <option value="consumer">Consumers</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                
                <button 
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  disabled={users.length === 0}
                >
                  <Download className="h-4 w-4" />
                  <span>Export ({users.length})</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
                <span className="ml-2 text-gray-600">Loading users from Firebase...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-600 mb-2">⚠️ Error Loading Data</div>
                <div className="text-gray-600 text-center max-w-md">{error}</div>
                <button 
                  onClick={handleRefreshData}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <div className="text-gray-600">
                  {users.length === 0 ? 'No users found in database' : 'No users match your search criteria'}
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username || 'No Name'}</div>
                            <div className="text-sm text-gray-500">{user.email || 'No Email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'farmer' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {user.role === 'farmer' ? <Sprout className="h-3 w-3 mr-1" /> : <ShoppingCart className="h-3 w-3 mr-1" />}
                          {(user.role || 'unknown').charAt(0).toUpperCase() + (user.role || 'unknown').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 text-gray-400 mr-2" />
                            {user.phonenumber || 'N/A'}
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 text-gray-400 mr-2" />
                            <span className="truncate max-w-32">{user.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                          <span>{user.city || 'Unknown'}, {user.state || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-2" />
                          {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.uid, user.username || user.email)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowUserModal(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {(selectedUser.username || selectedUser.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{selectedUser.username || 'No Name'}</h4>
                      <p className="text-gray-600">{selectedUser.email || 'No Email'}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        selectedUser.role === 'farmer' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {(selectedUser.role || 'unknown').charAt(0).toUpperCase() + (selectedUser.role || 'unknown').slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm"><strong>Phone:</strong> {selectedUser.phonenumber || 'N/A'}</p>
                        <p className="text-sm"><strong>Email:</strong> {selectedUser.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm">{selectedUser.addressline1 || 'N/A'}</p>
                        {selectedUser.addressline2 && <p className="text-sm">{selectedUser.addressline2}</p>}
                        <p className="text-sm">{selectedUser.street || 'N/A'}, {selectedUser.area || 'N/A'}</p>
                        <p className="text-sm">{selectedUser.city || 'N/A'}, {selectedUser.state || 'N/A'} - {selectedUser.pincode || 'N/A'}</p>
                        <p className="text-sm">{selectedUser.country || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Details</label>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm"><strong>User ID:</strong> {selectedUser.uid}</p>
                        <p className="text-sm"><strong>Created:</strong> {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Translate Button Styles */}
      <style jsx global>{`
        .translate-micro {
          position: relative;
          margin: 0 8px;
          display: inline-block;
          width: 20px;
          height: 20px;
        }
        
        /* Hide Google branding but keep dropdown functional */
        .goog-te-gadget > span > a,
        .goog-te-gadget .goog-logo-link,
        .goog-te-gadget span:first-child,
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        
        .goog-te-gadget {
          font-size: 0 !important;
          line-height: 0 !important;
        }
        
        /* Style the actual Google dropdown */
        .goog-te-combo {
          position: absolute !important;
          opacity: 0 !important;
          pointer-events: none !important;
          width: 20px !important;
          height: 20px !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 1 !important;
        }
        
        /* Custom translate button overlay */
        .custom-translate-btn {
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 5;
          pointer-events: auto;
        }
        
        .custom-translate-btn:active {
          transform: scale(0.95);
        }
        
        /* When dropdown is opened, show it */
        .translate-micro.open .goog-te-combo {
          opacity: 1 !important;
          pointer-events: auto !important;
          position: absolute !important;
          top: 25px !important;
          left: -20px !important;
          width: auto !important;
          height: auto !important;
          background: white !important;
          border: 1px solid #ccc !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          z-index: 1000 !important;
        }
        
        .translate-micro.open .goog-te-combo option {
          padding: 4px 8px !important;
          font-size: 12px !important;
          color: #333 !important;
        }

        /* Mobile translate button */
        .mobile-translate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          font-size: 20px;
          cursor: pointer;
          border-radius: 10px;
          background: #f4f8f6;
          border: 2px solid #004e16;
          color: #004e16;
          box-shadow: 0 4px 15px rgba(70, 181, 127, 0.4);
          position: relative;
        }

        .mobile-translate-btn:active {
          transform: scale(0.95);
        }

        /* Custom dropdown animation */
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Custom scrollbar for mobile dropdown */
        .custom-mobile-dropdown::-webkit-scrollbar {
          width: 6px;
        }

        .custom-mobile-dropdown::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .custom-mobile-dropdown::-webkit-scrollbar-thumb {
          background: #46b57f;
          border-radius: 3px;
        }

        .custom-mobile-dropdown::-webkit-scrollbar-thumb:hover {
          background: #004e16;
        }
      `}</style>
    </div>
  );
}