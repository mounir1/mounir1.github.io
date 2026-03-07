import React from 'react';
import { SkillsManager } from '@/components/admin/SkillsManager';

// Container component for skills management tab
// Currently composes the existing SkillsManager to avoid duplication.
// Future: replace internal usage with SkillForm, SkillCard, and SkillBulkActions for finer control.
export function SkillsTab() {
  return <SkillsManager />;
}

export default SkillsTab;
