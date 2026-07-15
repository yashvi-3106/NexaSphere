import bcrypt from 'bcryptjs';
import { usersRepository } from '../repositories/usersRepository.js';
import { studentAuthService } from '../services/studentAuthService.js';
import { withDb } from '../repositories/db.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const localLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(req, res, 'Email and password are required', 400, 'VALIDATION_ERROR');
  }

  try {
    const user = await withDb(async (client) => {
      const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0];
    });

    if (!user) {
      return sendError(req, res, 'Invalid email or password', 401, 'UNAUTHORIZED');
    }

    if (!user.password_hash) {
      return sendError(req, res, 'Local login is not enabled for this user', 401, 'UNAUTHORIZED');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return sendError(req, res, 'Invalid email or password', 401, 'UNAUTHORIZED');
    }

    // Map `users` table fields to the payload expected by studentAuthService
    const tokenPayload = {
      id: user.id,
      provider: 'local',
      email: user.email,
      full_name: user.display_name,
      role: user.role || 'user',
    };

    const token = studentAuthService.generateToken(tokenPayload);

    res.cookie('ns_student_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, { user: tokenPayload });
  } catch (error) {
    console.error('Local login error:', error);
    return sendError(req, res, 'Internal server error', 500, 'INTERNAL_ERROR');
  }
};
