// server/services/mentorshipService.js
import { profileSetupSchema } from '../validators/mentorshipValidator.js';

/**
 * Calculates a compatibility percentage score between a mentor and a mentee profile.
 */
export const calculateCompatibilityScore = (mentor, mentee) => {
  let score = 0;

  // 1. Skill Matching (Weight: 40%)
  const matchedSkills = mentor.skills.filter((skill) => mentee.skills.includes(skill));
  if (matchedSkills.length > 0) {
    score += Math.min(matchedSkills.length * 15, 40);
  }

  // 2. Timezone / Overlap Match (Weight: 30%)
  if (mentor.timezone === mentee.timezone) {
    score += 30;
  } else {
    // Partial score for shared items in availability array
    const overlapHours = mentor.availability.filter((time) => mentee.availability.includes(time));
    if (overlapHours.length > 0) score += 15;
  }

  // 3. Communication Style Match (Weight: 30%)
  if (mentor.communication_style.toLowerCase() === mentee.communication_style.toLowerCase()) {
    score += 30;
  }

  return score;
};

/**
 * Generates pairing recommendations for a specific mentee
 */
export const getRecommendedMentors = async (menteeProfile, allMentors) => {
  return allMentors
    .map((mentor) => {
      const score = calculateCompatibilityScore(mentor, menteeProfile);
      return { mentor, compatibilityScore: score };
    })
    .filter((match) => match.compatibilityScore >= 40) // Threshold filter
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
