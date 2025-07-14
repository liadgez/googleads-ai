const mondaySdk = require('monday-sdk-js');

// Initialize Monday SDK
const token = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
const monday = mondaySdk({ token });

const boardId = '9576217097';
const itemId = '9581080331'; // The test milestone we just created
const statusColumnId = 'color_mksrcbaq';

async function changeStatusToDone() {
  try {
    console.log('🔄 Changing status to "Done"...');
    console.log('Item ID:', itemId);
    console.log('Status Column ID:', statusColumnId);
    
    // Change status to "Done" (index 1, label "Done")
    const updateQuery = `
      mutation {
        change_column_value(
          board_id: ${boardId}
          item_id: ${itemId}
          column_id: "${statusColumnId}"
          value: "{\\"label\\": \\"Done\\", \\"index\\": 1}"
        ) {
          id
          name
          column_values {
            id
            text
            value
          }
        }
      }
    `;
    
    console.log('\n📤 Sending status change to Monday API...');
    const result = await monday.api(updateQuery);
    
    if (result.data && result.data.change_column_value) {
      const item = result.data.change_column_value;
      console.log('\n✅ Status changed successfully!');
      console.log('Item:', item.name);
      
      // Find the status column value
      const statusCol = item.column_values.find(col => col.id === statusColumnId);
      if (statusCol) {
        console.log('New Status:', statusCol.text);
      }
      
      console.log('\n⏳ The webhook should now trigger and move the item to Done group...');
      console.log('Check the server logs and Monday board to verify!');
      
      // Wait a bit then check if item moved
      setTimeout(async () => {
        console.log('\n🔍 Checking if item moved to Done group...');
        
        const checkQuery = `
          query {
            items(ids: [${itemId}]) {
              id
              name
              group {
                id
                title
              }
            }
          }
        `;
        
        const checkResult = await monday.api(checkQuery);
        if (checkResult.data && checkResult.data.items[0]) {
          const movedItem = checkResult.data.items[0];
          console.log('\n📍 Current location:');
          console.log('Group:', movedItem.group.title);
          console.log('Group ID:', movedItem.group.id);
          
          if (movedItem.group.title === 'Done') {
            console.log('\n🎉 SUCCESS! Item was automatically moved to Done group by the webhook!');
          } else {
            console.log('\n⚠️  Item is still in:', movedItem.group.title);
            console.log('The webhook may not have triggered properly.');
          }
        }
      }, 3000); // Wait 3 seconds before checking
      
    } else {
      console.error('Failed to update status:', result);
    }
    
  } catch (error) {
    console.error('Error changing status:', error);
  }
}

// Run the status change
changeStatusToDone();