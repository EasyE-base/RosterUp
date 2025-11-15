/**
 * Apple-Style Design System Components
 *
 * A comprehensive set of components matching the Landing page aesthetic
 * Based on Apple's minimalist design language
 */

// Button Components
export { AppleButton } from './AppleButton';
export type { AppleButtonProps } from './AppleButton';

// Card Components
export {
  AppleCard,
  AppleCardHeader,
  AppleCardTitle,
  AppleCardDescription,
  AppleCardContent,
  AppleCardFooter,
} from './AppleCard';
export type { AppleCardProps } from './AppleCard';

// Typography Components
export {
  AppleHeading,
  AppleHeroHeading,
  AppleSectionHeading,
  AppleCardHeading,
} from './AppleHeading';
export type { AppleHeadingProps } from './AppleHeading';

// Form Components
export { AppleInput, AppleTextarea, AppleSelect } from './AppleInput';
export type { AppleInputProps, AppleTextareaProps, AppleSelectProps } from './AppleInput';

// Search Component
export { AppleSearchBar } from './AppleSearchBar';
export type { AppleSearchBarProps } from './AppleSearchBar';

// Badge Components
export { AppleBadge, AppleStatusBadge, AppleSportBadge } from './AppleBadge';
export type { AppleBadgeProps } from './AppleBadge';

// Stat Card Component
export { AppleStatCard } from './AppleStatCard';
export type { AppleStatCardProps } from './AppleStatCard';

// Empty State Component
export { AppleEmptyState } from './AppleEmptyState';
export type { AppleEmptyStateProps } from './AppleEmptyState';

// Avatar Components
export { AppleAvatar, AppleAvatarGroup } from './AppleAvatar';
export type { AppleAvatarProps, AppleAvatarGroupProps } from './AppleAvatar';

// Modal Component
export { AppleModal } from './AppleModal';
export type { AppleModalProps } from './AppleModal';

// Metadata Component
export { AppleMetadataRow, AppleIconText } from './AppleMetadataRow';
export type { AppleMetadataRowProps } from './AppleMetadataRow';

// Design Tokens
export {
  appleColors,
  appleTypography,
  appleSpacing,
  appleBorderRadius,
  appleShadows,
  appleAnimations,
  appleBreakpoints,
  appleIconSizes,
  appleZIndex,
  getAppleTailwindClasses,
} from '../../lib/appleDesignTokens';
