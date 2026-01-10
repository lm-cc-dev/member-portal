/**
 * Script to check for test user in Baserow Members table
 */

import { findMemberByEmail } from '../lib/baserow/members';
import { MEMBER_STATUS_OPTIONS } from '../lib/baserow/config';

async function checkTestUser() {
  const testEmail = 'test1@gmail.com';

  console.log(`\n🔍 Searching for user: ${testEmail}\n`);

  try {
    const member = await findMemberByEmail(testEmail);

    if (!member) {
      console.log('❌ No member found with email:', testEmail);
      console.log('\n📝 You need to create a test member in Baserow.');
      return;
    }

    console.log('✅ Member found!\n');
    console.log('Member Details:');
    console.log('─'.repeat(50));
    console.log(`ID (Row ID):      ${member.id}`);
    console.log(`Member ID:        ${member['Member ID'] || 'Not set'}`);
    console.log(`Name:             ${member.Name || 'Not set'}`);
    console.log(`Email:            ${member.Email || 'Not set'}`);
    console.log(`Portal ID:        ${member['Portal ID'] || '❌ NOT SET'}`);

    // Check Member Status
    const memberStatus = member['Member Status'];
    if (memberStatus) {
      const isActive = memberStatus.id === MEMBER_STATUS_OPTIONS.ACTIVE;
      const statusEmoji = isActive ? '✅' : '⚠️';
      console.log(`Member Status:    ${statusEmoji} ${memberStatus.value} (ID: ${memberStatus.id})`);
    } else {
      console.log(`Member Status:    ❌ NOT SET`);
    }

    // Check Onboarding Status
    const onboardingStatus = member['Onboarding Status'];
    if (onboardingStatus) {
      console.log(`Onboarding:       ${onboardingStatus.value} (ID: ${onboardingStatus.id})`);
    } else {
      console.log(`Onboarding:       Not set`);
    }

    console.log('─'.repeat(50));

    // Analysis
    console.log('\n📊 Analysis:');
    if (!member['Portal ID']) {
      console.log('  • Portal ID is NOT set - this member has not registered yet');
    } else {
      console.log(`  • Portal ID is set (${member['Portal ID']}) - member has registered`);
    }

    if (memberStatus?.id === MEMBER_STATUS_OPTIONS.ACTIVE) {
      console.log('  • Member Status is "Active" - eligible to register');
    } else if (memberStatus?.id === MEMBER_STATUS_OPTIONS.INACTIVE) {
      console.log('  • Member Status is "Inactive" - NOT eligible to register');
    } else {
      console.log('  • Member Status is not set - NOT eligible to register');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Error checking member:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
  }
}

checkTestUser();
