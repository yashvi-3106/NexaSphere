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
 *   - name: Reporting Center
 *     description: Platform-Wide Data Export & Reporting Center
 */

/**
 * @swagger
 * /api/reporting-center/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reporting Center]
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */

/**
 * @swagger
 * /api/reporting-center/export:
 *   post:
 *     summary: Export data (CSV, Excel, PDF)
 *     tags: [Reporting Center]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Data exported successfully
 */

/**
 * @swagger
 * /api/reporting-center/schedule:
 *   post:
 *     summary: Schedule report generation
 *     tags: [Reporting Center]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Report scheduled successfully
 */

/**
 * @swagger
 * /api/reporting-center/custom:
 *   post:
 *     summary: Generate custom report
 *     tags: [Reporting Center]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Custom report generated successfully
 */

/**
 * @swagger
 * /api/reporting-center/templates:
 *   get:
 *     summary: Get saved report templates
 *     tags: [Reporting Center]
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 *
 *   post:
 *     summary: Save report template
 *     tags: [Reporting Center]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Template saved successfully
 */

/**
 * @swagger
 * /api/reporting-center/email:
 *   post:
 *     summary: Email report
 *     tags: [Reporting Center]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Report emailed successfully
 */

/**
 * @swagger
 * /api/reporting-center/dashboard:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Reporting Center]
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 */

/**
 * @swagger
 * /api/reporting-center/history:
 *   get:
 *     summary: Get report history
 *     tags: [Reporting Center]
 *     responses:
 *       200:
 *         description: Report history retrieved successfully
 */

/**
 * @swagger
 * /api/reporting-center/audit:
 *   get:
 *     summary: Get export audit logs
 *     tags: [Reporting Center]
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */

/**
 * @swagger
 * /api/reporting-center/filter:
 *   get:
 *     summary: Filter reports
 *     tags: [Reporting Center]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filtered reports returned successfully
 */

/**
 * @swagger
 * /api/reporting-center/permissions:
 *   get:
 *     summary: Get export permissions
 *     tags: [Reporting Center]
 *     responses:
 *       200:
 *         description: Export permissions retrieved successfully
 */

export default {};
