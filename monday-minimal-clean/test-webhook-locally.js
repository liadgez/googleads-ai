// Test script to simulate what happens when Monday.com sends a webhook
// Run this to see exactly what's happening with the move operation

const mondaySdk = require('monday-sdk-js');

async function testWebhookLocally() {
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
  const monday = mondaySdk({ token });
  
  const boardId = '9576217097';
  
  console.log('🔍 Testing webhook move operation locally...\n');
  
  try {
    // 1. Get all groups
    console.log('📋 Step 1: Getting all groups...');
    const groupsQuery = `
      query {
        boards(ids: [${boardId}]) {
          groups {
            id
            title
          }
        }
      }
    `;
    
    const groupsResult = await monday.api(groupsQuery);
    console.log('Groups response:', JSON.stringify(groupsResult, null, 2));
    
    if (groupsResult.errors) {
      console.error('❌ Error getting groups:', groupsResult.errors);
      return;
    }
    
    const groups = groupsResult.data.boards[0].groups;
    console.log('\n✅ Found groups:', groups.map(g => `${g.title} (${g.id})`).join(', '));
    
    // Find Done group
    const doneGroup = groups.find(g => g.title.toLowerCase().includes('done'));
    if (!doneGroup) {
      console.error('❌ No Done group found!');
      return;
    }
    console.log(`✅ Done group: ${doneGroup.title} (${doneGroup.id})`);
    
    // 2. Get a test item
    console.log('\n📋 Step 2: Getting test item...');
    const itemsQuery = `
      query {
        boards(ids: [${boardId}]) {
          items_page(limit: 1) {
            items {
              id
              name
              group {
                id
                title
              }
            }
          }
        }
      }
    `;
    
    const itemsResult = await monday.api(itemsQuery);
    console.log('Items response:', JSON.stringify(itemsResult, null, 2));
    
    if (itemsResult.errors || !itemsResult.data.boards[0].items_page.items[0]) {
      console.error('❌ No items found or error:', itemsResult.errors);
      return;
    }
    
    const testItem = itemsResult.data.boards[0].items_page.items[0];
    console.log(`\n✅ Test item: ${testItem.name} (${testItem.id})`);
    console.log(`   Currently in: ${testItem.group.title} (${testItem.group.id})`);
    
    if (testItem.group.id === doneGroup.id) {
      console.log('ℹ️  Item is already in Done group');
      return;
    }
    
    // 3. Try to move the item
    console.log('\n📋 Step 3: Attempting to move item...');
    const moveQuery = `
      mutation {
        move_item_to_group(
          item_id: ${testItem.id}
          group_id: "${doneGroup.id}"
        ) {
          id
        }
      }
    `;
    
    console.log('Move query:', moveQuery);
    
    const moveResult = await monday.api(moveQuery);
    console.log('\n📦 Move result:', JSON.stringify(moveResult, null, 2));
    
    if (moveResult.errors) {
      console.error('❌ Move failed with errors:', moveResult.errors);
      console.error('Error details:', moveResult.errors.map(e => e.message).join(', '));
    } else if (moveResult.data && moveResult.data.move_item_to_group) {
      console.log('✅ Move successful! Item ID:', moveResult.data.move_item_to_group.id);
      
      // 4. Verify the move
      console.log('\n📋 Step 4: Verifying move...');
      const verifyQuery = `
        query {
          items(ids: [${testItem.id}]) {
            id
            name
            group {
              id
              title
            }
          }
        }
      `;
      
      const verifyResult = await monday.api(verifyQuery);
      if (verifyResult.data && verifyResult.data.items[0]) {
        const newGroup = verifyResult.data.items[0].group;
        console.log(`✅ Item now in: ${newGroup.title} (${newGroup.id})`);
        console.log(`   Move verified: ${newGroup.id === doneGroup.id ? 'YES ✅' : 'NO ❌'}`);
      }
    } else {
      console.error('❌ Unexpected response:', moveResult);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testWebhookLocally();