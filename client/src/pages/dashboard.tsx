import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import HomeHeader from "@/components/home-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, Clock, MapPin, Star, User, CreditCard, Bell, MessageSquare,
  Home, Settings, BookOpen, TrendingUp, Phone, Edit, Plus, Filter,
  CheckCircle, XCircle, AlertCircle, DollarSign
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { Booking, User as UserType, ServiceProvider, Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function DashboardPage() {
  const { section = 'overview' } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Mock current user - in real app, this would come from auth context
  const currentUserId = 'customer-1';
  const [currentUser] = useState<UserType>({
    id: currentUserId,
    email: 'sarah@email.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+27821234567',
    role: 'customer',
    isVerified: true,
    createdAt: new Date(),
    preferences: {
      notifications: true,
      defaultLocation: 'Cape Town CBD',
      preferredProviders: [],
    }
  });

  // Fetch user's bookings
  const { data: bookings = [] } = useQuery({
    queryKey: [`/api/bookings?customerId=${currentUserId}`],
  });

  // Fetch user's notifications
  const { data: notifications = [] } = useQuery({
    queryKey: [`/api/notifications/${currentUserId}`],
  });

  // Fetch user's provider profile (if they are a provider)
  const { data: providerProfile } = useQuery({
    queryKey: [`/api/providers/user/${currentUserId}`],
    enabled: currentUser?.role === 'provider',
  });

  const [filters, setFilters] = useState({
    status: '',
    dateRange: 'all'
  });

  // Filter bookings based on current filters
  const filteredBookings = bookings.filter((booking: Booking) => {
    if (filters.status && booking.status !== filters.status) return false;
    if (filters.dateRange === 'upcoming') {
      return new Date(booking.scheduledDate) >= new Date();
    }
    if (filters.dateRange === 'past') {
      return new Date(booking.scheduledDate) < new Date();
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'pending': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'bookings', label: 'My Bookings', icon: BookOpen },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  // Provider-specific nav items
  if (currentUser?.role === 'provider') {
    navItems.splice(2, 0, 
      { id: 'earnings', label: 'Earnings', icon: DollarSign },
      { id: 'schedule', label: 'Schedule', icon: Calendar }
    );
  }

  const getUpcomingBookings = () => {
    return bookings
      .filter((booking: Booking) => new Date(booking.scheduledDate) >= new Date())
      .sort((a: Booking, b: Booking) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 3);
  };

  const getRecentBookings = () => {
    return bookings
      .filter((booking: Booking) => new Date(booking.scheduledDate) < new Date())
      .sort((a: Booking, b: Booking) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
      .slice(0, 5);
  };

  const getUnreadNotifications = () => {
    return notifications.filter((n: Notification) => !n.read).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader 
        isAuthenticated={true}
        user={currentUser}
        notificationCount={getUnreadNotifications().length}
        messageCount={2}
        onBookService={() => setLocation('/book')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </CardTitle>
                  <CardDescription>
                    {currentUser?.role === 'provider' ? 'Service Provider' : 'Customer'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setLocation(`/dashboard/${item.id}`)}
                        className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                          section === item.id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        data-testid={`nav-${item.id}`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                        {item.id === 'notifications' && getUnreadNotifications().length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {getUnreadNotifications().length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={() => setLocation('/book')}
                    className="w-full"
                    data-testid="dashboard-book-service"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book New Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Section */}
            {section === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {currentUser?.firstName}!
                  </h1>
                  <p className="text-gray-600">
                    Here's what's happening with your home services
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {bookings.length}
                          </div>
                          <div className="text-sm text-gray-600">Total Bookings</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {bookings.filter((b: Booking) => b.status === 'completed').length}
                          </div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {getUpcomingBookings().length}
                          </div>
                          <div className="text-sm text-gray-600">Upcoming</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Services</CardTitle>
                    <CardDescription>
                      Your next scheduled services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getUpcomingBookings().length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming services</h3>
                        <p className="text-gray-600 mb-4">Book a service to get started</p>
                        <Button onClick={() => setLocation('/book')} data-testid="book-first-service">
                          Book Your First Service
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getUpcomingBookings().map((booking: any) => (
                          <div key={booking.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{booking.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status.replace('-', ' ')}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 space-x-4">
                                <span className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(booking.scheduledDate)}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {booking.scheduledTime}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {booking.address?.city}
                                </span>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setLocation(`/dashboard/bookings`)}
                              data-testid={`view-booking-${booking.id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity & Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getRecentBookings().length === 0 ? (
                        <p className="text-gray-600 text-center py-4">No recent activity</p>
                      ) : (
                        <div className="space-y-3">
                          {getRecentBookings().map((booking: any) => (
                            <div key={booking.id} className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                booking.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{booking.title}</p>
                                <p className="text-xs text-gray-600">
                                  {formatDate(booking.scheduledDate)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        Notifications
                        {getUnreadNotifications().length > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {getUnreadNotifications().length}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getUnreadNotifications().length === 0 ? (
                        <p className="text-gray-600 text-center py-4">No new notifications</p>
                      ) : (
                        <div className="space-y-3">
                          {getUnreadNotifications().map((notification: Notification) => (
                            <div key={notification.id} className="flex items-start">
                              <Bell className="w-4 h-4 text-blue-600 mr-3 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{notification.title}</p>
                                <p className="text-xs text-gray-600">{notification.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Bookings Section */}
            {section === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
                    <p className="text-gray-600">Manage your service appointments</p>
                  </div>
                  <Button 
                    onClick={() => setLocation('/book')}
                    data-testid="new-booking-cta"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                      </div>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1"
                        data-testid="filter-status"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1"
                        data-testid="filter-date"
                      >
                        <option value="all">All Time</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Bookings List */}
                <div className="space-y-4">
                  {filteredBookings.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-600 mb-4">
                          {filters.status || filters.dateRange !== 'all' 
                            ? 'Try adjusting your filters' 
                            : 'Book your first service to get started'}
                        </p>
                        <Button 
                          onClick={() => setLocation('/book')}
                          data-testid="book-service-empty"
                        >
                          Book a Service
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredBookings.map((booking: any) => {
                      const StatusIcon = getStatusIcon(booking.status);
                      return (
                        <Card key={booking.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900 mr-3">
                                    {booking.title}
                                  </h3>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {booking.status.replace('-', ' ').toUpperCase()}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{formatDate(booking.scheduledDate)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>{booking.scheduledTime}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{booking.address?.street}, {booking.address?.city}</span>
                                  </div>
                                </div>

                                {booking.description && (
                                  <p className="text-gray-600 mb-4">{booking.description}</p>
                                )}

                                {booking.provider && (
                                  <div className="flex items-center mb-4">
                                    <User className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">
                                      Provider: {booking.provider.user?.firstName} {booking.provider.user?.lastName}
                                    </span>
                                    <div className="flex items-center ml-4">
                                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                      <span className="text-xs text-gray-600">{booking.provider.rating}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="text-right ml-6">
                                <div className="text-2xl font-bold text-gray-900 mb-2">
                                  {formatCurrency(booking.totalAmount)}
                                </div>
                                <div className="space-y-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    data-testid={`view-booking-details-${booking.id}`}
                                  >
                                    View Details
                                  </Button>
                                  {booking.status === 'confirmed' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      data-testid={`reschedule-booking-${booking.id}`}
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Reschedule
                                    </Button>
                                  )}
                                  {booking.status === 'completed' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full"
                                      data-testid={`review-booking-${booking.id}`}
                                    >
                                      <Star className="w-3 h-3 mr-1" />
                                      Review
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Other sections would go here (messages, notifications, etc.) */}
            {section === 'messages' && (
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Communicate with your service providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600">Messages with your providers will appear here</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {section === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Stay updated with your service activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                      <p className="text-gray-600">We'll notify you about important updates</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification: Notification) => (
                        <div key={notification.id} className={`p-4 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full ml-4 mt-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {section === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={currentUser?.firstName}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          data-testid="settings-first-name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={currentUser?.lastName}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          data-testid="settings-last-name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={currentUser?.email}
                        className="w-full p-3 border border-gray-300 rounded-md"
                        data-testid="settings-email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={currentUser?.phone}
                        className="w-full p-3 border border-gray-300 rounded-md"
                        data-testid="settings-phone"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={currentUser?.preferences?.notifications}
                          className="w-4 h-4 text-blue-600"
                          data-testid="settings-notifications"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Receive email notifications
                        </span>
                      </label>
                    </div>

                    <Button data-testid="save-settings">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}