import { NextResponse } from 'next/server';

export async function GET() {
  const resourceLinks = [
    {
      category: 'Column 1',
      links: [
        'Creator Support',
        'Published On Epic',
        'Profession',
        'Company'
      ]
    },
    {
      category: 'Column 2',
      links: [
        'Fan Work Policy',
        'User Exp Service',
        'User Liscence'
      ]
    },
    {
      category: 'Column 3',
      links: [
        'Online Service',
        'Community',
        'Epic Newsroom'
      ]
    },
    {
      category: 'Column 4',
      links: [
        'Battle Breakers',
        'Fortnite',
        'Infinity Blade'
      ]
    },
    {
      category: 'Column 5',
      links: [
        'Robo Recall',
        'Shadow Complex',
        'Unreal Tournament'
      ]
    }
  ];

  return NextResponse.json(resourceLinks);
}
