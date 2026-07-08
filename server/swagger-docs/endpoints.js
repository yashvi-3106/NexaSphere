/**
 * Authentication API Endpoints Documentation
 * All auth-related endpoints with request/response examples
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: user-123
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate with email and password to get JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify email token
 *     description: Verify user email with verification token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: verification-token-abc123
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     description: Get a new JWT token using refresh token
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Unauthorized - token expired or invalid
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     description: Retrieve list of all events with pagination and filtering
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *         description: Filter by event status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search events by name
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create new event
 *     description: Create a new event (admin only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - location
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tech Workshop
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-15T10:00:00Z'
 *               location:
 *                 type: string
 *                 example: Building A, Room 101
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 */

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     summary: Get event details
 *     description: Retrieve details of a specific event
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/{eventId}:
 *   put:
 *     summary: Update event
 *     description: Update event details (admin only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/{eventId}:
 *   delete:
 *     summary: Delete event
 *     description: Delete an event (admin only)
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/{eventId}/register:
 *   post:
 *     summary: Register for event
 *     description: Register current user for an event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Successfully registered for event
 *       400:
 *         description: Already registered or event full
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/{eventId}/stats:
 *   get:
 *     summary: Get event statistics
 *     description: Get registration and attendance statistics for an event
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRegistrations:
 *                       type: integer
 *                     attendance:
 *                       type: integer
 *                     attendanceRate:
 *                       type: number
 *                       format: float
 *                     avgRating:
 *                       type: number
 *                       format: float
 */

/**
 * @swagger
 * tags:
 *   - name: Duplicate Detection
 *     description: Intelligent Duplicate Detection APIs
 */

/**
 * @swagger
 * /api/duplicates/overview:
 *   get:
 *     summary: Get duplicate detection overview
 *     tags: [Duplicate Detection]
 *     responses:
 *       200:
 *         description: Duplicate overview retrieved successfully.
 */

/**
 * @swagger
 * /api/duplicates/check:
 *   post:
 *     summary: Check a record for possible duplicates
 *     tags: [Duplicate Detection]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Duplicate check completed.
 */

/**
 * @swagger
 * /api/duplicates/events:
 *   get:
 *     summary: Detect duplicate events
 *     tags: [Duplicate Detection]
 *     responses:
 *       200:
 *         description: Duplicate events retrieved.
 */

/**
 * @swagger
 * /api/duplicates/media:
 *   get:
 *     summary: Detect duplicate media
 *     tags: [Duplicate Detection]
 *     responses:
 *       200:
 *         description: Duplicate media retrieved.
 */

/**
 * @swagger
 * /api/duplicates/portfolios:
 *   get:
 *     summary: Detect duplicate portfolios
 *     tags: [Duplicate Detection]
 *     responses:
 *       200:
 *         description: Duplicate portfolios retrieved.
 */

/**
 * @swagger
 * /api/duplicates/clubs:
 *   get:
 *     summary: Detect duplicate club registrations
 *     tags: [Duplicate Detection]
 *     responses:
 *       200:
 *         description: Duplicate club registrations retrieved.
 */

/**
 * @swagger
 * /api/duplicates/merge:
 *   post:
 *     summary: Merge duplicate records
 *     tags: [Duplicate Detection]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id1:
 *                 type: string
 *               id2:
 *                 type: string
 *     responses:
 *       200:
 *         description: Records merged successfully.
 */

/**
 * @swagger
 * /api/duplicates/{id}:
 *   delete:
 *     summary: Delete duplicate record
 *     tags: [Duplicate Detection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Duplicate record deleted successfully.
 */

/**
 * @swagger
 * /api/duplicates/stats:
 *   get:
 *     summary: Get duplicate detection statistics
 *     tags: [Duplicate Detection]
 *     responses:
 *       200:
 *         description: Duplicate statistics retrieved successfully.
 */

/**
 * @swagger
 * tags:
 *   name: Operational Insights
 *   description: Platform Operational Insights & Health Command Center APIs
 */

/**
 * @swagger
 * /api/operational-insights/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Dashboard overview retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/health:
 *   get:
 *     summary: Get system health
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: System health retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/users:
 *   get:
 *     summary: Get active user statistics
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/traffic:
 *   get:
 *     summary: Get API traffic analytics
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: API traffic retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/database:
 *   get:
 *     summary: Get database performance
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Database performance retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/jobs:
 *   get:
 *     summary: Get background job status
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Background jobs retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/storage:
 *   get:
 *     summary: Get storage utilization
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Storage usage retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/notifications:
 *   get:
 *     summary: Get notification delivery statistics
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/errors:
 *   get:
 *     summary: Get error monitoring logs
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Error logs retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/maintenance:
 *   get:
 *     summary: Get scheduled maintenance
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Maintenance schedule retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/dependencies:
 *   get:
 *     summary: Get service dependency status
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Dependencies retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/resources:
 *   get:
 *     summary: Get resource consumption
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Resource utilization retrieved successfully
 */

/**
 * @swagger
 * /api/operational-insights/reports:
 *   get:
 *     summary: Get operational reports
 *     tags: [Operational Insights]
 *     responses:
 *       200:
 *         description: Operational reports retrieved successfully
 */

/**
 * @swagger
 * tags:
 *   name: Workflow Automation
 *   description: APIs for managing approval workflows, requests, analytics, and audit logs.
 */

/**
 * @swagger
 * /api/workflow-automation/workflows:
 *   get:
 *     summary: Get all workflows
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: List of workflows retrieved successfully
 *
 *   post:
 *     summary: Create a new workflow
 *     tags: [Workflow Automation]
 *     responses:
 *       201:
 *         description: Workflow created successfully
 */

/**
 * @swagger
 * /api/workflow-automation/workflows/{id}:
 *   get:
 *     summary: Get workflow by ID
 *     tags: [Workflow Automation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workflow retrieved successfully
 *
 *   put:
 *     summary: Update workflow
 *     tags: [Workflow Automation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workflow updated successfully
 *
 *   delete:
 *     summary: Delete workflow
 *     tags: [Workflow Automation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workflow deleted successfully
 */

/**
 * @swagger
 * /api/workflow-automation/requests:
 *   post:
 *     summary: Submit a workflow request
 *     tags: [Workflow Automation]
 *     responses:
 *       201:
 *         description: Request submitted successfully
 */

/**
 * @swagger
 * /api/workflow-automation/requests/{id}/approve:
 *   put:
 *     summary: Approve a workflow request
 *     tags: [Workflow Automation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request approved successfully
 */

/**
 * @swagger
 * /api/workflow-automation/requests/{id}/reject:
 *   put:
 *     summary: Reject a workflow request
 *     tags: [Workflow Automation]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Request rejected successfully
 */

/**
 * @swagger
 * /api/workflow-automation/requests/bulk-approve:
 *   post:
 *     summary: Bulk approve workflow requests
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: Requests approved successfully
 */

/**
 * @swagger
 * /api/workflow-automation/requests/pending:
 *   get:
 *     summary: Get pending workflow requests
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 */

/**
 * @swagger
 * /api/workflow-automation/history:
 *   get:
 *     summary: Get approval history
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: Approval history retrieved successfully
 */

/**
 * @swagger
 * /api/workflow-automation/templates:
 *   get:
 *     summary: Get workflow templates
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: Workflow templates retrieved successfully
 */

/**
 * @swagger
 * /api/workflow-automation/analytics:
 *   get:
 *     summary: Get workflow analytics
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: Workflow analytics retrieved successfully
 */

/**
 * @swagger
 * /api/workflow-automation/escalate:
 *   post:
 *     summary: Escalate pending workflow requests
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: Pending requests escalated successfully
 */

/**
 * @swagger
 * /api/workflow-automation/audit-logs:
 *   get:
 *     summary: Get workflow audit logs
 *     tags: [Workflow Automation]
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */

export default {};
