import { useState } from 'react';
import { Mentor } from '../types';

interface UseMentorComparisonReturn {
    selectedMentors: Mentor[];
    addMentorToCompare: (mentor: Mentor) => void;
    removeMentorFromCompare: (mentorName: string) => void;
    clearComparison: () => void;
    canAddMore: boolean;
    isComparing: boolean;
}

/**
 * Hook untuk manage mentor comparison state
 * Max 3 mentors dapat dibandingkan sekaligus
 */
export const useMentorComparison = (): UseMentorComparisonReturn => {
    const [selectedMentors, setSelectedMentors] = useState<Mentor[]>([]);

    const addMentorToCompare = (mentor: Mentor) => {
        const exists = selectedMentors.some(m => m.name === mentor.name);
        if (exists) {
            // Toggle off: remove if already selected
            removeMentorFromCompare(mentor.name);
        } else if (selectedMentors.length < 3) {
            // Toggle on: add if not selected and under limit
            setSelectedMentors([...selectedMentors, mentor]);
        }
    };

    const removeMentorFromCompare = (mentorName: string) => {
        setSelectedMentors(selectedMentors.filter(m => m.name !== mentorName));
    };

    const clearComparison = () => {
        setSelectedMentors([]);
    };

    return {
        selectedMentors,
        addMentorToCompare,
        removeMentorFromCompare,
        clearComparison,
        canAddMore: selectedMentors.length < 3,
        isComparing: selectedMentors.length > 0
    };
};
