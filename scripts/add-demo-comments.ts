/**
 * Script to add demo comments for testing
 *
 * Run with: npx tsx scripts/add-demo-comments.ts
 *
 * Tables used:
 * - 756: Deals (to find Dubai deal)
 * - 347: Members (to get member IDs)
 * - 772: Deal Process (to add members to deal)
 * - 778: Deal Comments (member comments)
 * - 779: Samira Comments (CEO comments)
 * - 780: Steering Committee Comments
 */

import { listRows, createRow, getRow, updateRow } from '../lib/baserow/client';
import { TABLES } from '../lib/baserow/config';

const DEAL_COMMENTS_TABLE = 778;
const SAMIRA_COMMENTS_TABLE = 779;
const STEERCO_COMMENTS_TABLE = 780;
const DEAL_PROCESS_TABLE = 772;

async function main() {
  console.log('🔍 Finding Dubai deal...');

  // List deals to find Dubai
  const deals = await listRows<any>(TABLES.DEALS, {
    useFieldNames: true,
    size: 50,
  });

  const dubaiDeal = deals.results.find((d: any) =>
    d['Name']?.toLowerCase().includes('dubai') ||
    d['Deal Summary']?.toLowerCase().includes('dubai')
  );

  if (!dubaiDeal) {
    console.log('Available deals:', deals.results.map((d: any) => ({ id: d.id, name: d['Name'] })));
    throw new Error('Dubai deal not found');
  }

  console.log(`✅ Found Dubai deal: ID ${dubaiDeal.id} - "${dubaiDeal['Name']}"`);

  // Get members
  console.log('\n🔍 Getting members...');
  const members = await listRows<any>(TABLES.MEMBERS, {
    useFieldNames: true,
    size: 20,
  });

  console.log('Available members:', members.results.map((m: any) => ({
    id: m.id,
    name: m['Name']
  })));

  // Use first few members for demo
  const demoMembers = members.results.slice(0, 5);

  if (demoMembers.length < 3) {
    throw new Error('Need at least 3 members for demo');
  }

  const [member1, member2, member3, member4, member5] = demoMembers;

  // Add members to Deal Process (so they appear as involved in the deal)
  console.log('\n📝 Adding members to Deal Process...');

  for (const member of [member2, member3, member4].filter(Boolean)) {
    try {
      await createRow(DEAL_PROCESS_TABLE, {
        'Deal': [dubaiDeal.id],
        'Member': [member.id],
        'Status': 3129, // "Underwriting" option
        'Date Registered': new Date().toISOString().split('T')[0],
        'Signed CC NDA': true,
      }, true);
      console.log(`  ✅ Added ${member['Name']} to deal process`);
    } catch (e: any) {
      console.log(`  ⚠️ ${member['Name']}: ${e.message || 'already exists or error'}`);
    }
  }

  // Add SteerCo members to the deal
  console.log('\n👥 Adding SteerCo members to deal...');
  try {
    const currentSteerco = dubaiDeal['SteerCo Members'] || [];
    const steercoIds = [...new Set([
      ...currentSteerco.map((m: any) => m.id),
      member1.id,
      member2.id,
    ])];

    await updateRow(TABLES.DEALS, dubaiDeal.id, {
      'SteerCo Members': steercoIds,
    }, true);
    console.log(`  ✅ Updated SteerCo members`);
  } catch (e: any) {
    console.log(`  ⚠️ SteerCo update: ${e.message}`);
  }

  // Add Member Comments (Table 778)
  console.log('\n💬 Adding Member Comments...');

  const memberComments = [
    {
      author: member1,
      text: "I've reviewed the preliminary deck and the Dubai market opportunity looks compelling. The management team has strong local connections which will be crucial for market entry.",
      isAnonymous: false,
      steercoOnly: false,
    },
    {
      author: member2,
      text: "The valuation seems reasonable given comparable transactions in the region. I'd like to see more details on the regulatory landscape before committing.",
      isAnonymous: false,
      steercoOnly: false,
    },
    {
      author: member3,
      text: "Has anyone done due diligence on the founding team's previous ventures? I have some concerns about execution risk.",
      isAnonymous: true, // Anonymous comment
      steercoOnly: false,
    },
    {
      author: member4 || member1,
      text: "CONFIDENTIAL: My legal team flagged some concerns with the deal structure that we should discuss privately before the full group call.",
      isAnonymous: false,
      steercoOnly: true, // SteerCo only
    },
    {
      author: member2,
      text: "Following up on the regulatory question - I connected with a local advisor and can share insights on the next call.",
      isAnonymous: false,
      steercoOnly: false,
    },
  ];

  for (const comment of memberComments) {
    try {
      await createRow(DEAL_COMMENTS_TABLE, {
        'Deal': [dubaiDeal.id],
        'Author': [comment.author.id],
        'Comment Text': comment.text,
        'Is Anonymous': comment.isAnonymous,
        'SteerCo Only': comment.steercoOnly,
        'Active': true,
        'Is Deleted': false,
      }, true);
      console.log(`  ✅ Added comment from ${comment.isAnonymous ? 'Anonymous' : comment.author['Name']}${comment.steercoOnly ? ' (SteerCo Only)' : ''}`);
    } catch (e: any) {
      console.log(`  ⚠️ Error: ${e.message}`);
    }
  }

  // Add Samira Comments (Table 779)
  console.log('\n✨ Adding Samira (CEO) Comments...');

  const samiraComments = [
    {
      text: "I'm very excited about this opportunity. The Dubai market represents a strategic expansion for our portfolio, and the timing aligns well with our 2025 thesis on emerging market infrastructure.",
      targetMembers: [], // Visible to all
    },
    {
      text: "Based on our conversation last week, I wanted to share some additional context on why this deal is particularly relevant for your portfolio focus. Let's discuss on our next 1:1.",
      targetMembers: [member1.id], // Targeted to specific member
    },
  ];

  for (const comment of samiraComments) {
    try {
      await createRow(SAMIRA_COMMENTS_TABLE, {
        'Deal': [dubaiDeal.id],
        'Comment Text': comment.text,
        'Target Members': comment.targetMembers,
        'Active': true,
        'Is Deleted': false,
      }, true);
      console.log(`  ✅ Added Samira comment${comment.targetMembers.length > 0 ? ' (targeted)' : ' (all members)'}`);
    } catch (e: any) {
      console.log(`  ⚠️ Error: ${e.message}`);
    }
  }

  // Add SteerCo Comments (Table 780)
  console.log('\n🔒 Adding Steering Committee Comments...');

  const steercoComments = [
    {
      author: member1,
      text: "From a governance perspective, we should ensure all members have completed their NDAs before the deep-dive session next week.",
    },
    {
      author: member2,
      text: "I've spoken with two other family offices who have exposure to the region. Happy to make introductions if helpful for due diligence.",
    },
    {
      author: member1,
      text: "Reminder: The allocation committee meets Thursday to finalize member commitments. Please have your preliminary indications submitted by Wednesday EOD.",
    },
  ];

  for (const comment of steercoComments) {
    try {
      await createRow(STEERCO_COMMENTS_TABLE, {
        'Deal': [dubaiDeal.id],
        'Author': [comment.author.id],
        'Comment Text': comment.text,
        'Active': true,
        'Is Deleted': false,
      }, true);
      console.log(`  ✅ Added SteerCo comment from ${comment.author['Name']}`);
    } catch (e: any) {
      console.log(`  ⚠️ Error: ${e.message}`);
    }
  }

  console.log('\n✅ Demo data added successfully!');
  console.log(`\n📊 Summary for Deal ID ${dubaiDeal.id} (${dubaiDeal['Name']}):`);
  console.log(`   - ${memberComments.length} member comments`);
  console.log(`   - ${samiraComments.length} Samira comments`);
  console.log(`   - ${steercoComments.length} SteerCo comments`);
  console.log(`   - SteerCo members: ${member1['Name']}, ${member2['Name']}`);
}

main().catch(console.error);
