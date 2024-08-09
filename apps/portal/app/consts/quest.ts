import comingSoonImage from '@assets/coming-soon-image.png'
import narrativeStandardImage from '@assets/narrative-standard-image.png'
import { QuestSet } from 'app/types/quest'

export const QUEST_LOG_DESCRIPTION =
  'Something inside you stirs, urging you to rekindle and reclaim humanity’s lost intuition...'

export const STANDARD_QUEST_SET: QuestSet = {
  imgSrc: narrativeStandardImage,
  title: 'Tutorial Island: The Primitive Elements',
  description: 'Learn the core elements of the Intuition System',
  summary:
    'Complete the chapters below to learn the core primitives that make up the Intuition system.',
  navigatePath: '/app/quest/narrative/0',
}

export const COMING_SOON_QUEST_SET: QuestSet = {
  imgSrc: comingSoonImage,
  title: 'Coming Soon',
  description: 'Our interns are hard at work.',
  summary: 'Our interns are hard at work.',
  navigatePath: '',
}

export const FALLBACK_IDENTITY_ID = 'd72adfd5-c872-4c8e-9864-cb3c5217df2b'

export const FALLBACK_CLAIM_ID = 'b07c739e-6d46-4145-abd4-102a2351c585'

export const FALLBACK_COUNTER_CLAIM_ID = '7df63698-2f30-46d8-ae6a-3dfe672c2722'

export const FALLBACK_QUEST_PLACEHOLDER_IMAGE =
  'https://res.cloudinary.com/dfpwy9nyv/image/upload/f_auto,q_auto/v1/Portal%20Assets/quests/quest-placeholder'