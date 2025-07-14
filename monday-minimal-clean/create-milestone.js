const mondaySdk = require('monday-sdk-js');

// Initialize Monday SDK
const token = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
const monday = mondaySdk({ token });

const boardId = '9576217097';
const milestoneGroupId = 'group_mkstev7t'; // Milestone group

async function createMilestone() {
  try {
    console.log('Creating test milestone item...');
    
    // Create item in the Milestone group
    const createQuery = `
      mutation {
        create_item(
          board_id: ${boardId}
          group_id: "${milestoneGroupId}"
          item_name: "Webhook Test Milestone - ${new Date().toLocaleTimeString()}"
          column_values: "{\\"color_mksrcbaq\\": {\\"label\\": \\"Working on it\\"}, \\"long_text_mkstkne0\\": {\\"text\\": \\"This milestone will test the webhook when status changes to Done\\"}}"
        ) {
          id
          name
          group {
            id
            title
          }
          column_values {
            id
            text
            value
          }
        }
      }
    `;
    
    const result = await monday.api(createQuery);
    
    if (result.data && result.data.create_item) {
      const item = result.data.create_item;
      console.log('\n✅ Milestone created successfully!');
      console.log('Item ID:', item.id);
      console.log('Item Name:', item.name);
      console.log('Group:', item.group.title);
      console.log('\nColumn values:');
      item.column_values.forEach(col => {
        if (col.text) {
          console.log(`  ${col.id}: ${col.text}`);
        }
      });
      console.log('\n📋 Next steps:');
      console.log('1. Go to your Monday board');
      console.log('2. Find the item:', item.name);
      console.log('3. Change the Status column to "Done"');
      console.log('4. Watch the webhook logs to see if it moves to Done group');
      
      return item;
    } else {
      console.error('Failed to create item:', result);
    }
    
  } catch (error) {
    console.error('Error creating milestone:', error);
  }
}

// Run the creation
createMilestone();