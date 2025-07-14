const mondaySdk = require('monday-sdk-js');

// Test script to debug move_item_to_group operation
async function testMoveOperation() {
  const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
  const monday = mondaySdk({ token });
  const boardId = '9576217097';
  
  console.log('🔍 Testing Move Operation Debug Script\n');
  
  try {
    // Step 1: Get board structure
    console.log('📋 Step 1: Fetching board structure...');
    const boardQuery = `
      query {
        boards(ids: [${boardId}]) {
          name
          permissions
          groups {
            id
            title
          }
          items_page(limit: 5) {
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
    
    const boardResult = await monday.api(boardQuery);
    
    if (boardResult.errors) {
      console.error('❌ Board query errors:', boardResult.errors);
      return;
    }
    
    const board = boardResult.data.boards[0];
    console.log(`✅ Board: ${board.name}`);
    console.log(`   Permissions: ${board.permissions}`);
    console.log('\n📂 Groups:');
    board.groups.forEach(g => console.log(`   - ${g.title} (${g.id})`));
    
    // Find Done group
    const doneGroup = board.groups.find(g => 
      g.title.toLowerCase().includes('done') || 
      g.title.toLowerCase().includes('complete')
    );
    
    if (!doneGroup) {
      console.error('\n❌ No Done group found!');
      return;
    }
    
    console.log(`\n✅ Done group found: ${doneGroup.title} (${doneGroup.id})`);
    
    // Find a test item not in Done group
    const testItem = board.items_page.items.find(item => item.group.id !== doneGroup.id);
    
    if (!testItem) {
      console.log('\n⚠️ No items found outside Done group to test with');
      return;
    }
    
    console.log(`\n📌 Test item: ${testItem.name}`);
    console.log(`   Current group: ${testItem.group.title} (${testItem.group.id})`);
    
    // Step 2: Test the move operation
    console.log('\n📋 Step 2: Testing move operation...');
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
    
    console.log('📤 Sending move mutation...');
    console.log('   Query:', moveQuery.replace(/\s+/g, ' ').trim());
    
    const moveResult = await monday.api(moveQuery);
    
    console.log('\n📥 Raw API Response:');
    console.log(JSON.stringify(moveResult, null, 2));
    
    // Check for errors
    if (moveResult.errors && moveResult.errors.length > 0) {
      console.error('\n❌ GraphQL Errors:');
      moveResult.errors.forEach(err => {
        console.error(`   - ${err.message}`);
        if (err.extensions) {
          console.error(`     Extensions:`, err.extensions);
        }
      });
    }
    
    // Check if data exists
    if (moveResult.data && moveResult.data.move_item_to_group) {
      console.log('\n✅ Move operation returned data:');
      console.log(`   Item ID: ${moveResult.data.move_item_to_group.id}`);
      
      // Step 3: Verify the move
      console.log('\n📋 Step 3: Verifying item location...');
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
      const currentItem = verifyResult.data.items[0];
      
      console.log(`\n📍 Item current location: ${currentItem.group.title} (${currentItem.group.id})`);
      
      if (currentItem.group.id === doneGroup.id) {
        console.log('✅ SUCCESS: Item was moved to Done group!');
      } else {
        console.log('❌ FAILED: Item is not in Done group');
        console.log(`   Expected: ${doneGroup.id}`);
        console.log(`   Actual: ${currentItem.group.id}`);
      }
      
    } else {
      console.error('\n❌ No data returned from move operation');
    }
    
    // Step 4: Check user permissions
    console.log('\n📋 Step 4: Checking API token permissions...');
    const meQuery = `
      query {
        me {
          id
          name
          email
          teams {
            id
            name
          }
          account {
            id
            name
            plan {
              max_users
              period
              tier
              version
            }
          }
        }
      }
    `;
    
    const meResult = await monday.api(meQuery);
    if (meResult.data && meResult.data.me) {
      console.log(`\n👤 API Token User: ${meResult.data.me.name} (${meResult.data.me.email})`);
      console.log(`   User ID: ${meResult.data.me.id}`);
      if (meResult.data.me.account) {
        console.log(`   Account: ${meResult.data.me.account.name}`);
        console.log(`   Plan: ${meResult.data.me.account.plan.tier}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test script error:', error);
    console.error('   Type:', error.name);
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Response:', error.response);
    }
  }
}

// Run the test
console.log('🚀 Starting Monday.com Move Operation Test\n');
testMoveOperation().then(() => {
  console.log('\n✨ Test complete!');
}).catch(err => {
  console.error('\n💥 Test failed:', err);
});