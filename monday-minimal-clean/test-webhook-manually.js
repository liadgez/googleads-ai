const axios = require('axios');

// Simulate what Monday.com would send to our webhook
async function testWebhook() {
  const webhookUrl = 'http://localhost:8080/webhook/checkbox';
  
  // Create a payload that mimics what Monday sends when status changes to Done
  const payload = {
    event: {
      type: 'change_column_value',
      id: '123456789',
      boardId: 9576217097,
      groupId: 'group_mkstev7t',
      pulseId: 9581080331,
      pulseName: 'Webhook Test Milestone - 3:07:38 PM',
      columnId: 'color_mksrcbaq',
      columnType: 'color',
      columnTitle: 'Status',
      value: {
        label: {
          index: 1,
          text: 'Done',
          style: {
            color: '#00c875',
            border: '#00b461',
            var_name: 'green-shadow'
          },
          is_done: true
        },
        post_id: null,
        label_style: {
          color: '#00c875',
          border: '#00b461',
          var_name: 'green-shadow'
        },
        index: 1,
        changed_at: new Date().toISOString()
      },
      previousValue: {
        label: {
          index: 0,
          text: 'Working on it',
          style: {
            color: '#fdab3d',
            border: '#e99729',
            var_name: 'orange'
          },
          is_done: false
        }
      },
      changedAt: Date.now(),
      isTopGroup: true,
      app: 'monday',
      type: 'change_column_value',
      triggerTime: new Date().toISOString(),
      subscriptionId: 446067757,
      triggerUuid: 'test-' + Date.now()
    },
    // Simplified webhook format that matches what's expected
    boardId: '9576217097',
    pulseId: '9581080331',
    pulseName: 'Webhook Test Milestone - 3:07:38 PM',
    columnId: 'color_mksrcbaq',
    columnType: 'color',
    value: {
      label: 'Done',
      index: 1
    }
  };
  
  try {
    console.log('🚀 Sending test webhook to:', webhookUrl);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Monday-Webhook-Token': 'test-webhook'
      }
    });
    
    console.log('\n✅ Webhook response:', response.status);
    console.log('📥 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Webhook error:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
  testWebhook();
} catch(e) {
  console.log('Installing axios...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { stdio: 'inherit', cwd: __dirname });
  console.log('Axios installed. Please run this script again.');
}