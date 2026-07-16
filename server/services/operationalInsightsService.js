const dashboard = {
  activeUsers: 1284,
  onlineUsers: 214,
  totalApiRequests: 85321,
  successfulRequests: 84110,
  failedRequests: 1211,
  uptime: '99.98%',
  cpuUsage: '42%',
  memoryUsage: '61%',
  storageUsage: '72%',
  databaseStatus: 'Healthy',
  notificationQueue: 42,
  runningJobs: 8,
};

const services = [
  {
    id: 1,
    name: 'Authentication Service',
    status: 'Healthy',
    latency: '21ms',
  },
  {
    id: 2,
    name: 'Event Service',
    status: 'Healthy',
    latency: '35ms',
  },
  {
    id: 3,
    name: 'Portfolio Service',
    status: 'Healthy',
    latency: '28ms',
  },
  {
    id: 4,
    name: 'Media Service',
    status: 'Warning',
    latency: '112ms',
  },
  {
    id: 5,
    name: 'Notification Service',
    status: 'Healthy',
    latency: '19ms',
  },
];

const apiTraffic = [
  {
    endpoint: '/api/events',
    requests: 2451,
    avgResponse: '28ms',
  },
  {
    endpoint: '/api/auth/login',
    requests: 1876,
    avgResponse: '18ms',
  },
  {
    endpoint: '/api/portfolios',
    requests: 1342,
    avgResponse: '36ms',
  },
  {
    endpoint: '/api/announcements',
    requests: 964,
    avgResponse: '31ms',
  },
];

const databasePerformance = {
  connections: 41,
  maxConnections: 100,
  averageQueryTime: '17ms',
  slowQueries: 2,
  cacheHitRate: '96%',
  storageEngine: 'MongoDB',
};

const backgroundJobs = [
  {
    id: 1,
    name: 'Daily Backup',
    status: 'Running',
    progress: 63,
  },
  {
    id: 2,
    name: 'Notification Dispatcher',
    status: 'Running',
    progress: 91,
  },
  {
    id: 3,
    name: 'Media Optimization',
    status: 'Queued',
    progress: 0,
  },
];

const storage = {
  total: '500 GB',
  used: '361 GB',
  free: '139 GB',
  images: '152 GB',
  documents: '83 GB',
  backups: '126 GB',
};

const notifications = {
  todaySent: 524,
  delivered: 508,
  failed: 16,
  queued: 42,
  email: 283,
  push: 194,
  inApp: 47,
};

const errorLogs = [
  {
    id: 1,
    level: 'Warning',
    message: 'High memory usage detected',
    time: '10 mins ago',
  },
  {
    id: 2,
    level: 'Error',
    message: 'Media upload timeout',
    time: '32 mins ago',
  },
];

const operationalInsightsService = {
  getDashboardOverview() {
    return {
      success: true,
      data: dashboard,
    };
  },

  getSystemHealth() {
    return {
      success: true,
      overallStatus: 'Healthy',
      uptime: dashboard.uptime,
      services,
    };
  },

  getActiveUsers() {
    return {
      success: true,
      users: {
        active: dashboard.activeUsers,
        online: dashboard.onlineUsers,
        newToday: 37,
        returning: 196,
      },
    };
  },

  getApiTraffic() {
    return {
      success: true,
      totalRequests: dashboard.totalApiRequests,
      successful: dashboard.successfulRequests,
      failed: dashboard.failedRequests,
      endpoints: apiTraffic,
    };
  },

  getDatabasePerformance() {
    return {
      success: true,
      database: databasePerformance,
    };
  },

  getBackgroundJobs() {
    return {
      success: true,
      jobs: backgroundJobs,
    };
  },

  getStorageUsage() {
    return {
      success: true,
      storage,
    };
  },

  getNotificationStats() {
    return {
      success: true,
      notifications,
    };
  },

  getErrorLogs() {
    return {
      success: true,
      totalErrors: errorLogs.length,
      logs: errorLogs,
    };
  },

  getMaintenanceSchedule() {
    return {
      success: true,
      maintenance: [
        {
          id: 1,
          service: 'Database',
          scheduledDate: '2026-07-10',
          duration: '30 minutes',
          status: 'Scheduled',
        },
        {
          id: 2,
          service: 'Authentication',
          scheduledDate: '2026-07-15',
          duration: '15 minutes',
          status: 'Pending',
        },
      ],
    };
  },

  getDependencies() {
    return {
      success: true,
      dependencies: [
        {
          service: 'MongoDB',
          status: 'Healthy',
        },
        {
          service: 'Redis',
          status: 'Healthy',
        },
        {
          service: 'Cloudinary',
          status: 'Healthy',
        },
        {
          service: 'Email Service',
          status: 'Warning',
        },
        {
          service: 'Firebase',
          status: 'Healthy',
        },
      ],
    };
  },

  getResourceUsage() {
    return {
      success: true,
      resources: {
        cpu: {
          usage: '42%',
          cores: 8,
        },
        memory: {
          usage: '61%',
          total: '16 GB',
          used: '9.8 GB',
        },
        disk: {
          usage: '72%',
          total: '500 GB',
          used: '361 GB',
        },
        network: {
          upload: '124 Mbps',
          download: '256 Mbps',
        },
      },
    };
  },

  getOperationalReports() {
    return {
      success: true,
      reports: [
        {
          id: 1,
          title: 'Weekly System Health',
          generatedAt: '2026-07-02',
          format: 'PDF',
        },
        {
          id: 2,
          title: 'Monthly API Analytics',
          generatedAt: '2026-07-01',
          format: 'Excel',
        },
        {
          id: 3,
          title: 'Storage Utilization',
          generatedAt: '2026-06-30',
          format: 'CSV',
        },
        {
          id: 4,
          title: 'Notification Delivery Report',
          generatedAt: '2026-07-02',
          format: 'PDF',
        },
      ],
    };
  },
};

export default operationalInsightsService;
