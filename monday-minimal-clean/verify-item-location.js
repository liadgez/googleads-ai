const mondaySdk = require('monday-sdk-js');

// Initialize Monday SDK
const token = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
const monday = mondaySdk({ token });

const itemId = '9581080331';

async function verifyItemLocation() {
  try {
    const query = `
      query {
        items(ids: [${itemId}]) {
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
    
    const result = await monday.api(query);
    
    if (result.data && result.data.items[0]) {
      const item = result.data.items[0];
      console.log('\n📍 Item Location Verification:');
      console.log('================================');
      console.log('Item Name:', item.name);
      console.log('Item ID:', item.id);
      console.log('Current Group:', item.group.title);
      console.log('Group ID:', item.group.id);
      console.log('\nColumn Values:');
      
      item.column_values.forEach(col => {
        if (col.text) {
          console.log(`  ${col.id}: ${col.text}`);
        }
      });
      
      if (item.group.title === 'Done') {
        console.log('\n✅ SUCCESS! Item is in the Done group!');
        console.log('The webhook automation worked correctly.');
      } else {
        console.log('\n⚠️  Item is in:', item.group.title);
      }
      
    } else {
      console.error('Item not found');
    }
    
  } catch (error) {
    console.error('Error checking item:', error);
  }
}

verifyItemLocation();