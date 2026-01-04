
import { useMemo } from 'react';
import type { CharacterInput } from '../types';

export const useCharacterStats = (character: CharacterInput) => {
  const completionPercent = useMemo(() => {
    let completed = 0;
    const totalSteps = 7;

    const char = character as any;
    if (char.style?.genre) completed++;
    if (char.name) completed++;
    if (char.tags && char.tags.length > 0) completed++;
    if (char.appearance?.description) completed++;
    if (char.personality?.description) completed++;
    if (char.backstory?.fullStory) completed++;
    if (char.agent?.systemPrompt) completed++;

    return Math.round((completed / totalSteps) * 100);
  }, [character]);

  return { completionPercent };
};
