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
 * /api/media:
 *   get:
 *     summary: Get all uploaded media
 *     tags:
 *       - Media Management
 *     responses:
 *       200:
 *         description: Media files retrieved successfully
 */

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload a media file
 *     tags:
 *       - Media Management
 *     responses:
 *       201:
 *         description: File uploaded successfully
 */

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Delete a media file
 *     tags:
 *       - Media Management
 *     parameters:
 *       - in: path
 *         name: id
 * /api/portfolio/{username}/analytics:
 *   get:
 *     summary: Get portfolio analytics
 *     description: Retrieve portfolio performance analytics including profile visits, engagement, downloads, and project popularity.
 *     tags:
 *       - Portfolio
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio username
 *     responses:
 *       200:
 *         description: Portfolio analytics retrieved successfully
 *       404:
 *         description: Portfolio not found
 */
/**
 * @swagger
 * /api/portfolio/{username}/visit:
 *   post:
 *     summary: Record portfolio visit
 *     description: Records a visit to a user's portfolio for analytics purposes.
 *     tags:
 *       - Portfolio
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 */

/**
 * @swagger
 * /api/media/search:
 *   get:
 *     summary: Search uploaded files
 *     tags:
 *       - Media Management
 *     parameters:
 *       - in: query
 *         name: q
 *         description: Visit recorded successfully
 *       404:
 *         description: Portfolio not found
 */
/**
 * @swagger
 * /api/portfolio/{username}/monthly-report:
 *   get:
 *     summary: Get monthly analytics report
 *     description: Returns the monthly portfolio performance report.
 *     tags:
 *       - Portfolio
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Matching files returned
 *         description: Monthly report retrieved successfully
 *       404:
 *         description: Portfolio not found
 */
/**
 * @swagger
 * /api/portfolio/{username}/monthly-report:
 *   get:
 *     ...
 */

/**
 * @swagger
 * /api/media/storage:
 *   get:
 *     summary: Get storage usage statistics
 *     tags:
 *       - Media Management
 *     responses:
 *       200:
 *         description: Storage usage retrieved successfully
 * ...
 */

/**
 * @swagger
 * /api/recommendations/{userId}:
 *   get:
 *     summary: Get personalized recommendations
 *     tags:
 *       - Recommendation Engine
 *     responses:
 *       200:
 *         description: Personalized recommendations
 */

/**
 * @swagger
 * /api/recommendations/trending:
 *   get:
 *     summary: Get trending recommendations
 *     tags:
 *       - Recommendation Engine
 *     responses:
 *       200:
 *         description: Trending recommendations
 */

/**
 * @swagger
 * /api/recommendations/{userId}/feedback:
 *   post:
 *     summary: Submit recommendation feedback
 *     tags:
 *       - Recommendation Engine
 *     responses:
 *       200:
 *         description: Feedback submitted
 */

/**
 * @swagger
 * /api/recommendations/{userId}/interests:
 *   put:
 *     summary: Update user interests
 *     tags:
 *       - Recommendation Engine
 *     responses:
 *       200:
 *         description: Interests updated
 */

/**
 * @swagger
 * /api/recommendations/stats:
 *   get:
 *     summary: Recommendation analytics
 *     tags:
 *       - Recommendation Engine
 *     responses:
 *       200:
 *         description: Recommendation statistics
 */

/**
 * @swagger
 * tags:
 *   name: Draft Recovery
 *   description: Draft and Auto-Save Recovery APIs
 */

/**
 * @swagger
 * /api/drafts/{userId}:
 *   post:
 *     summary: Create a new draft
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               module:
 *                 type: string
 *                 example: events
 *               title:
 *                 type: string
 *                 example: AI Workshop Draft
 *               content:
 *                 type: string
 *                 example: Event description goes here...
 *     responses:
 *       201:
 *         description: Draft created successfully
 */

/**
 * @swagger
 * /api/drafts/{userId}:
 *   get:
 *     summary: Get all drafts for a user
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user drafts
 */

/**
 * @swagger
 * /api/drafts/{userId}/{draftId}:
 *   get:
 *     summary: Get a specific draft
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: draftId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft retrieved successfully
 */

/**
 * @swagger
 * /api/drafts/{draftId}:
 *   put:
 *     summary: Update an existing draft (Auto Save)
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: draftId
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
 *               content:
 *                 type: string
 *                 example: Updated draft content...
 *     responses:
 *       200:
 *         description: Draft updated successfully
 */

/**
 * @swagger
 * /api/drafts/{draftId}:
 *   delete:
 *     summary: Delete a draft
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: draftId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft deleted successfully
 */

/**
 * @swagger
 * /api/drafts/{draftId}/restore:
 *   post:
 *     summary: Restore latest version of a draft
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: draftId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft restored successfully
 */

/**
 * @swagger
 * /api/drafts/{draftId}/history:
 *   get:
 *     summary: Get version history of a draft
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: draftId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Version history retrieved successfully
 */

/**
 * @swagger
 * /api/drafts/{draftId}/sync:
 *   post:
 *     summary: Synchronize draft across devices
 *     tags: [Draft Recovery]
 *     parameters:
 *       - in: path
 *         name: draftId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft synchronized successfully
 */

/**
 * @swagger
 * /api/drafts/stats:
 *   get:
 *     summary: Get draft recovery statistics
 *     tags: [Draft Recovery]
 *     responses:
 *       200:
 *         description: Draft statistics retrieved successfully
 */

/**
 * @swagger
 * tags:
 *   - name: Event Resources
 *     description: Event Resource & Inventory Management APIs
 */

/**
 * @swagger
 * /api/event-resources:
 *   get:
 *     summary: Get all event resources
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: List of resources
 *
 *   post:
 *     summary: Create a new resource
 *     tags:
 *       - Event Resources
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Resource created
 */

/**
 * @swagger
 * /api/event-resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags:
 *       - Event Resources
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource details
 *
 *   put:
 *     summary: Update resource
 *     tags:
 *       - Event Resources
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource updated
 *
 *   delete:
 *     summary: Delete resource
 *     tags:
 *       - Event Resources
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource deleted
 */

/**
 * @swagger
 * /api/event-resources/{id}/reserve:
 *   post:
 *     summary: Reserve a resource
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Resource reserved
 */

/**
 * @swagger
 * /api/event-resources/{id}/return:
 *   post:
 *     summary: Return a reserved resource
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Resource returned
 */

/**
 * @swagger
 * /api/event-resources/{id}/assign:
 *   post:
 *     summary: Assign resource to an event
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Resource assigned
 */

/**
 * @swagger
 * /api/event-resources/{id}/report-damage:
 *   post:
 *     summary: Report damaged resource
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Damage reported
 */

/**
 * @swagger
 * /api/event-resources/{id}/maintenance:
 *   put:
 *     summary: Update maintenance status
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Maintenance status updated
 */

/**
 * @swagger
 * /api/event-resources/{id}/availability:
 *   get:
 *     summary: Check resource availability
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Availability information
 */

/**
 * @swagger
 * /api/event-resources/conflicts/all:
 *   get:
 *     summary: Detect resource conflicts
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Conflict report
 */

/**
 * @swagger
 * /api/event-resources/calendar/availability:
 *   get:
 *     summary: View availability calendar
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Availability calendar
 */

/**
 * @swagger
 * /api/event-resources/{id}/qrcode:
 *   get:
 *     summary: Generate QR code for resource
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: QR code generated
 */

/**
 * @swagger
 * /api/event-resources/{id}/history:
 *   get:
 *     summary: Get borrow history
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Borrow history
 */

/**
 * @swagger
 * /api/event-resources/analytics/inventory:
 *   get:
 *     summary: Inventory analytics
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Inventory analytics
 */

/**
 * @swagger
 * /api/event-resources/analytics/utilization:
 *   get:
 *     summary: Resource utilization report
 *     tags:
 *       - Event Resources
 *     responses:
 *       200:
 *         description: Utilization analytics
 */

export default {};
