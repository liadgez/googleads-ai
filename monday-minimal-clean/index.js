// Minimal Monday Code App - List All Tasks
const express = require('express');
const mondaySdk = require('monday-sdk-js');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'monday-minimal-app',
    timestamp: new Date().toISOString()
  });
});

// Board view for Monday app
app.get('/board-view', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Minimal Task Lister</title>
        <script src="https://cdn.jsdelivr.net/npm/monday-sdk-js/dist/main.js"></script>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            max-width: 800px; 
            margin: 0 auto; 
          }
          .btn { 
            padding: 15px 30px; 
            background: #0073ea; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
            margin: 10px 0;
          }
          .btn:hover { background: #005bb5; }
          #output { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-top: 20px; 
            min-height: 200px;
            border: 1px solid #e9ecef;
          }
          .task-item {
            padding: 8px 12px;
            margin: 4px 0;
            background: white;
            border-radius: 4px;
            border-left: 4px solid #0073ea;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .task-count {
            font-weight: bold;
            color: #0073ea;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <h1>📋 Minimal Task Lister</h1>
        <p>Simple tool to list all task names from your Monday.com board</p>
        
        <button class="btn" onclick="listAllTasks()">📝 List All Tasks</button>
        <button class="btn" onclick="setupWebhook()">⚡ Setup Status Automation</button>
        <button class="btn" onclick="createLinkButtons()">🚀 Create Link Buttons</button>
        <button class="btn" onclick="deleteWebhooks()" style="background: #e74c3c;">🗑️ Delete All Webhooks</button>
        
        <div id="output">Click the buttons above to list tasks or setup webhook...</div>
        
        <script>
          async function listAllTasks() {
            const output = document.getElementById('output');
            output.innerHTML = '⏳ Loading tasks...';
            
            try {
              const response = await fetch('/api/list-tasks', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              });
              
              const result = await response.json();
              
              if (result.success) {
                const tasks = result.tasks;
                let html = '<div class="task-count">Found ' + tasks.length + ' tasks:</div>';
                
                tasks.forEach((task, index) => {
                  html += '<div class="task-item">' + (index + 1) + '. ' + task.name + '</div>';
                });
                
                output.innerHTML = html;
              } else {
                output.innerHTML = '<div style="color: red;">Error: ' + result.error + '</div>';
              }
            } catch (error) {
              output.innerHTML = '<div style="color: red;">Error: ' + error.message + '</div>';
            }
          }
          
          async function setupWebhook() {
            const output = document.getElementById('output');
            output.innerHTML = '⚡ Setting up status automation...';
            
            try {
              const response = await fetch('/api/setup-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              const result = await response.json();
              
              if (result.success) {
                output.innerHTML = '<div style="color: green;">✅ Status automation setup successful!</div>' +
                  '<p><strong>Status Columns Found:</strong> ' + result.statusColumnsFound + '</p>' +
                  '<p><strong>Webhook ID:</strong> ' + result.webhookId + '</p>' +
                  '<div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 10px 0;">'+
                  '<p><strong>📋 How it works:</strong></p>' +
                  '<p>• Change any status to "Done", "Complete", "Finished" or green color</p>' +
                  '<p>• Items will automatically move to your Done group</p>' +
                  '<p>• Works on columns: ' + (result.statusColumns ? result.statusColumns.map(c => c.title).join(', ') : 'Status columns') + '</p>' +
                  '</div>';
              } else {
                output.innerHTML = '<div style="color: red;">❌ Error: ' + result.error + '</div>';
                if (result.details) {
                  output.innerHTML += '<p style="color: #666;"><strong>Details:</strong> ' + result.details + '</p>';
                }
                if (result.webhookUrl) {
                  output.innerHTML += '<p style="color: #666;"><strong>Webhook URL:</strong> ' + result.webhookUrl + '</p>';
                }
                if (result.boardId) {
                  output.innerHTML += '<p style="color: #666;"><strong>Board ID:</strong> ' + result.boardId + '</p>';
                }
                if (result.availableColumns) {
                  output.innerHTML += '<p style="color: #666;">Available columns: ' + result.availableColumns.map(c => c.title + ' (' + c.type + ')').join(', ') + '</p>';
                }
                if (result.errors) {
                  output.innerHTML += '<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">' + JSON.stringify(result.errors, null, 2) + '</pre>';
                }
              }
            } catch (error) {
              output.innerHTML = '<div style="color: red;">❌ Error: ' + error.message + '</div>';
            }
          }
          
          async function createLinkButtons() {
            const output = document.getElementById('output');
            output.innerHTML = '🚀 Creating link buttons...';
            
            try {
              const response = await fetch('/api/create-link-buttons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              const result = await response.json();
              
              if (result.success) {
                output.innerHTML = '<div style="color: green;">✅ Link buttons created successfully!</div>' +
                  '<p><strong>Column:</strong> ' + result.linkColumn + '</p>' +
                  '<p><strong>Items Updated:</strong> ' + result.itemsUpdated + '</p>' +
                  '<p>Check your Monday board - you should see "🚀 Take Action" links in the Link column!</p>' +
                  '<p style="font-size: 14px; color: #666;">Click these links in your board to test the functionality.</p>';
              } else {
                output.innerHTML = '<div style="color: red;">❌ Error: ' + result.error + '</div>';
                if (result.instruction) {
                  output.innerHTML += '<p style="color: orange;">💡 ' + result.instruction + '</p>';
                }
              }
            } catch (error) {
              output.innerHTML = '<div style="color: red;">❌ Error: ' + error.message + '</div>';
            }
          }
          
          async function deleteWebhooks() {
            const output = document.getElementById('output');
            output.innerHTML = '🗑️ Deleting all webhooks...';
            
            try {
              const response = await fetch('/api/delete-webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              const result = await response.json();
              
              if (result.success) {
                output.innerHTML = '<div style="color: green;">✅ Webhooks deleted successfully!</div>' +
                  '<p><strong>Deleted:</strong> ' + result.deletedCount + ' webhook(s)</p>' +
                  '<p>You can now set up fresh webhook automation.</p>';
              } else {
                output.innerHTML = '<div style="color: red;">❌ Error: ' + result.error + '</div>';
              }
            } catch (error) {
              output.innerHTML = '<div style="color: red;">❌ Error: ' + error.message + '</div>';
            }
          }
          
          // Initialize Monday SDK
          if (typeof monday !== 'undefined') {
            monday.listen("context", (res) => {
              console.log("Monday context:", res.data);
            });
          }
        </script>
      </body>
    </html>
  `);
});

// API endpoint to list all tasks
app.get('/api/list-tasks', async (req, res) => {
  try {
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    
    const boardId = process.env.BOARD_ID || '9576217097';
    
    const query = `
      query {
        boards(ids: [${boardId}]) {
          id
          name
          items_page(limit: 500) {
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
    
    console.log('Fetching tasks from board:', boardId);
    
    const response = await monday.api(query);
    
    if (response.data && response.data.boards && response.data.boards[0]) {
      const board = response.data.boards[0];
      const tasks = board.items_page.items;
      
      console.log(`Found ${tasks.length} tasks`);
      
      res.json({
        success: true,
        boardId: board.id,
        boardName: board.name,
        taskCount: tasks.length,
        tasks: tasks.map(task => ({
          id: task.id,
          name: task.name,
          group: task.group.title
        }))
      });
    } else {
      res.json({
        success: false,
        error: 'Board not found or no access',
        boardId
      });
    }
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to setup webhook
app.post('/api/setup-webhook', async (req, res) => {
  try {
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    
    const boardId = process.env.BOARD_ID || '9576217097';
    // Use the Monday Code deployment URL pattern
    // The MONDAY_APP_URL should be set as an environment variable to the stable tunnel URL
    const deploymentUrl = process.env.MONDAY_APP_URL || process.env.DEPLOYMENT_URL || 'https://tunnel-service-4905568-eca6c204.us.monday.app';
    const webhookUrl = `${deploymentUrl}/webhook`;
    
    console.log('🌐 Webhook URL will be:', webhookUrl);
    
    // Get board structure to find status columns
    const columnsQuery = `
      query {
        boards(ids: [${boardId}]) {
          columns {
            id
            title
            type
          }
        }
      }
    `;
    
    const columnsResult = await monday.api(columnsQuery);
    
    if (columnsResult.errors && columnsResult.errors.length > 0) {
      console.log('❌ Error fetching columns:', columnsResult.errors);
      return res.json({
        success: false,
        error: 'Failed to fetch board columns',
        errors: columnsResult.errors,
        details: columnsResult.errors.map(err => err.message).join(', ')
      });
    }
    
    if (!columnsResult.data || !columnsResult.data.boards || !columnsResult.data.boards[0]) {
      return res.json({
        success: false,
        error: 'Board not found or no access',
        boardId
      });
    }
    
    const columns = columnsResult.data.boards[0].columns;
    
    // Find all status/color columns
    const statusColumns = columns.filter(col => 
      col.type === 'color' || 
      col.type === 'status' || 
      col.title.toLowerCase().includes('status')
    );
    
    console.log('🎯 Found status columns:', statusColumns);
    
    if (statusColumns.length === 0) {
      return res.json({
        success: false,
        error: 'No status columns found on this board',
        availableColumns: columns.map(c => ({ id: c.id, title: c.title, type: c.type }))
      });
    }
    
    // Skip checking existing webhooks for now - this query might be causing issues
    // const checkQuery = `
    //   query {
    //     webhooks(board_id: ${boardId}) {
    //       id
    //       event
    //       config
    //     }
    //   }
    // `;
    
    // const existingWebhooks = await monday.api(checkQuery);
    // console.log('📋 Existing webhooks:', existingWebhooks.data.webhooks);
    
    // Create webhook for any column value change
    // We'll filter for status columns in the webhook handler
    const query = `
      mutation {
        create_webhook(
          board_id: ${boardId}
          url: "${webhookUrl}"
          event: change_column_value
        ) {
          id
          board_id
        }
      }
    `;
    
    console.log('🔗 Creating webhook for board:', boardId);
    console.log('📍 Webhook URL:', webhookUrl);
    
    const response = await monday.api(query);
    console.log('📦 Webhook creation response:', JSON.stringify(response, null, 2));
    
    // Check for errors in response
    if (response.errors && response.errors.length > 0) {
      console.log('❌ GraphQL Errors:', response.errors);
      return res.json({
        success: false,
        error: 'GraphQL errors occurred',
        errors: response.errors,
        details: response.errors.map(err => err.message).join(', '),
        webhookUrl: webhookUrl,
        boardId: boardId
      });
    }
    
    if (response.data && response.data.create_webhook) {
      console.log('✅ Webhook created successfully!');
      console.log('🆔 Webhook ID:', response.data.create_webhook.id);
      
      res.json({
        success: true,
        message: 'Status automation webhook created successfully!',
        webhookId: response.data.create_webhook.id,
        boardId: response.data.create_webhook.board_id,
        webhookUrl,
        event: 'change_column_value',
        statusColumnsFound: statusColumns.length,
        statusColumns: statusColumns.map(col => ({ id: col.id, title: col.title, type: col.type })),
        instructions: `Now change any status in these columns to "Done" or a green color: ${statusColumns.map(c => c.title).join(', ')}`
      });
    } else {
      console.log('❌ Failed to create webhook - no data returned');
      
      res.json({
        success: false,
        error: 'Failed to create webhook - no data returned',
        response: response
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating webhook:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name
    });
  }
});

// Webhook endpoint for column changes (checkbox, status, etc.)
app.post('/webhook/checkbox', async (req, res) => {
  try {
    console.log('🔔 Webhook request received:', JSON.stringify(req.body, null, 2));
    
    // Handle webhook challenge for verification
    if (req.body.challenge) {
      console.log('📋 Webhook challenge received:', req.body.challenge);
      return res.json({ challenge: req.body.challenge });
    }
    
    const { event, pulseName, pulseId, columnId, value, boardId, columnType } = req.body;
    
    // Log the column change
    console.log(`📝 Column change detected:`);
    console.log(`   Item: ${pulseName} (ID: ${pulseId})`);
    console.log(`   Column: ${columnId} (Type: ${columnType})`);
    console.log(`   New Value: ${JSON.stringify(value)}`);
    console.log(`   Board: ${boardId}`);
    
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    
    let shouldMoveToComplete = false;
    let actionReason = '';
    
    // Check if it's a checkbox column being checked
    if (columnType === 'checkbox' || value?.checked !== undefined) {
      const isChecked = value && (value.checked === true || value.checked === 'true');
      if (isChecked) {
        shouldMoveToComplete = true;
        actionReason = 'Checkbox was checked';
        console.log(`✅ Checkbox was CHECKED for item: ${pulseName}`);
      }
    }
    
    // Known status column IDs from your board
    const statusColumnIds = ['color_mksrcbaq', 'color_mkstgh5n', 'status_2', 'color_mkstczb6'];
    
    // Check if this is one of your status columns
    const isStatusColumn = statusColumnIds.includes(columnId);
    
    console.log(`🔍 Column analysis:`);
    console.log(`   Column ID: ${columnId}`);
    console.log(`   Is Status Column: ${isStatusColumn}`);
    console.log(`   Column Type: ${columnType}`);
    
    if (isStatusColumn && (columnType === 'color' || columnType === 'status' || value?.label !== undefined || value?.index !== undefined)) {
      const statusLabel = value?.label?.toLowerCase() || '';
      const statusIndex = value?.index;
      
      console.log(`🏷️ Status change detected - Label: "${statusLabel}", Index: ${statusIndex}`);
      
      // Check for "Done" variations in the label
      const doneVariations = ['done', 'complete', 'completed', 'finished', 'closed'];
      const isDoneLabel = doneVariations.some(variation => statusLabel.includes(variation));
      
      // Common "Done" status indices (usually green colors are index 1, 4, or 40)
      const doneIndices = [1, 4, 40]; // These are typically green in Monday.com
      const isDoneIndex = doneIndices.includes(statusIndex);
      
      if (isDoneLabel || isDoneIndex) {
        shouldMoveToComplete = true;
        actionReason = `Status column "${columnId}" changed to "${statusLabel}" (index: ${statusIndex})`;
        console.log(`✅ Status set to DONE for item: ${pulseName} - ${actionReason}`);
      } else {
        console.log(`ℹ️ Status changed but not to Done: "${statusLabel}" (index: ${statusIndex})`);
      }
    } else if (!isStatusColumn) {
      console.log(`⏭️ Column change ignored - not a status column: ${columnId}`);
    }
    
    if (shouldMoveToComplete) {
      try {
        // Get all groups in the board to find "Done" group
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
        const groups = groupsResult.data.boards[0].groups;
        
        // Find "Done" group (case insensitive)
        const doneGroup = groups.find(group => 
          group.title.toLowerCase().includes('done') || 
          group.title.toLowerCase().includes('complete') ||
          group.title.toLowerCase().includes('finished')
        );
        
        if (doneGroup) {
          console.log(`📁 Found Done group: ${doneGroup.title} (${doneGroup.id})`);
          
          // First, check if item is already in Done group
          const itemQuery = `
            query {
              items(ids: [${pulseId}]) {
                id
                name
                group {
                  id
                  title
                }
              }
            }
          `;
          
          const itemResult = await monday.api(itemQuery);
          
          if (itemResult.data && itemResult.data.items && itemResult.data.items[0]) {
            const currentGroup = itemResult.data.items[0].group;
            console.log(`📍 Item currently in group: ${currentGroup.title} (${currentGroup.id})`);
            
            if (currentGroup.id === doneGroup.id) {
              console.log('ℹ️ Item is already in Done group, skipping move');
              return res.json({
                success: true,
                message: 'Item already in Done group',
                action: 'already_in_done_group',
                itemId: pulseId,
                itemName: pulseName,
                currentGroup: currentGroup.title
              });
            }
          }
          
          console.log(`🚀 Moving item from ${itemResult.data.items[0].group.title} to ${doneGroup.title}`);
          
          // Move item to Done group
          const moveQuery = `
            mutation {
              move_item_to_group(
                item_id: ${pulseId}
                group_id: "${doneGroup.id}"
              ) {
                id
              }
            }
          `;
          
          const moveResult = await monday.api(moveQuery);
          console.log('📦 Move operation response:', JSON.stringify(moveResult, null, 2));
          
          // Check for GraphQL errors
          if (moveResult.errors && moveResult.errors.length > 0) {
            console.error('❌ GraphQL errors in move operation:', moveResult.errors);
            return res.json({
              success: false,
              error: 'Failed to move item - GraphQL errors',
              graphqlErrors: moveResult.errors,
              details: moveResult.errors.map(err => err.message).join(', ')
            });
          }
          
          // Verify the move was successful
          if (!moveResult.data || !moveResult.data.move_item_to_group) {
            console.error('❌ Move operation failed - no data returned');
            return res.json({
              success: false,
              error: 'Move operation failed - no confirmation received',
              response: moveResult
            });
          }
          
          console.log('✅ Item moved successfully via automation');
          
          res.json({
            success: true,
            message: `Automation triggered: ${actionReason}`,
            action: 'moved_to_done_group',
            itemId: pulseId,
            itemName: pulseName,
            targetGroup: doneGroup.title,
            reason: actionReason
          });
        } else {
          console.log('⚠️ No Done group found for automation');
          res.json({
            success: true,
            message: `${actionReason} but no Done group found`,
            action: 'done_status_no_group',
            itemId: pulseId,
            itemName: pulseName,
            availableGroups: groups.map(g => g.title)
          });
        }
        
      } catch (moveError) {
        console.error('❌ Error moving item:', moveError);
        res.json({
          success: false,
          error: `Failed to move item: ${moveError.message}`,
          reason: actionReason
        });
      }
    } else {
      // No automation triggered
      console.log(`ℹ️ Column change detected but no automation triggered`);
      res.json({
        success: true,
        message: `Column change recorded: ${columnType}`,
        action: 'change_logged',
        itemId: pulseId,
        itemName: pulseName
      });
    }
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to check webhook functionality
app.get('/webhook/test', (req, res) => {
  res.json({
    message: 'Webhook endpoint is running!',
    url: '/webhook/checkbox',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
});

// Integration endpoint for button clicks (Button Column)
app.post('/integration/button-clicked', async (req, res) => {
  try {
    console.log('🔘 Button clicked event received:', JSON.stringify(req.body, null, 2));
    
    const { payload } = req.body;
    const { itemId, boardId, columnId, userId } = payload;
    
    console.log(`📋 Button Action:`)
    console.log(`   Item ID: ${itemId}`)
    console.log(`   Board ID: ${boardId}`)
    console.log(`   Column ID: ${columnId}`)
    console.log(`   User ID: ${userId}`)
    
    // Here you can add your custom logic for button clicks
    // For example: update status, move to group, create task, etc.
    
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    
    // Example action: Add a comment to the item
    const commentQuery = `
      mutation {
        create_update(
          item_id: ${itemId}
          body: "🔘 Button was clicked! Action performed automatically by Minimal Task Lister app."
        ) {
          id
        }
      }
    `;
    
    const result = await monday.api(commentQuery);
    console.log('✅ Comment added to item:', result);
    
    res.json({
      success: true,
      message: 'Button click processed successfully',
      itemId,
      boardId,
      action: 'comment_added',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Button click error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to create Link column entries (Link Button approach)
app.post('/api/create-link-buttons', async (req, res) => {
  try {
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    const boardId = process.env.BOARD_ID || '9576217097';
    
    // First, get all items from the board (using the working query pattern)
    const itemsQuery = `
      query {
        boards(ids: [${boardId}]) {
          id
          name
          items_page(limit: 100) {
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
    
    console.log('📊 Items query result:', JSON.stringify(itemsResult, null, 2));
    
    if (!itemsResult.data || !itemsResult.data.boards || !itemsResult.data.boards[0]) {
      return res.json({
        success: false,
        error: 'Board not found or no access to board',
        debug: itemsResult
      });
    }
    
    const board = itemsResult.data.boards[0];
    const items = board.items_page.items;
    
    console.log(`📋 Found ${items.length} items in board: ${board.name}`);
    
    // Get board columns to find link columns
    const columnsQuery = `
      query {
        boards(ids: [${boardId}]) {
          columns {
            id
            title
            type
          }
        }
      }
    `;
    
    const columnsResult = await monday.api(columnsQuery);
    
    if (!columnsResult.data || !columnsResult.data.boards || !columnsResult.data.boards[0]) {
      return res.json({
        success: false,
        error: 'Could not fetch board columns',
        debug: columnsResult
      });
    }
    
    const columns = columnsResult.data.boards[0].columns;
    const linkColumns = columns.filter(col => col.type === 'link');
    
    console.log('🔗 Available columns:', columns.map(c => `${c.title} (${c.type})`));
    console.log('🔗 Link columns found:', linkColumns);
    
    if (linkColumns.length === 0) {
      return res.json({
        success: false,
        error: 'No Link column found. Please create a Link column in your board first.',
        instruction: 'Add a new column to your board and select "Link" as the column type.',
        availableColumns: columns.map(c => ({ title: c.title, type: c.type }))
      });
    }
    
    // Use the first link column found
    const linkColumn = linkColumns[0];
    console.log(`🔗 Using Link column: ${linkColumn.title} (ID: ${linkColumn.id})`);
    
    // Update each item with a link button (limit to first 5 items for testing)
    const updatePromises = items.slice(0, Math.min(5, items.length)).map(async (item) => {
      const linkValue = {
        url: `https://d4fe9-service-4905568-eca6c204.us.monday.app/api/link-action?itemId=${item.id}&action=clicked`,
        text: "🚀 Take Action"
      };
      
      const updateQuery = `
        mutation {
          change_multiple_column_values(
            item_id: ${item.id}
            board_id: ${boardId}
            column_values: "{\\"${linkColumn.id}\\" : {\\"url\\" : \\"${linkValue.url}\\", \\"text\\":\\"${linkValue.text}\\"}}"
          ) {
            id
          }
        }
      `;
      
      console.log(`🔄 Updating item ${item.name} (${item.id}) with link`);
      return monday.api(updateQuery);
    });
    
    const results = await Promise.all(updatePromises);
    
    console.log('✅ Link creation results:', results);
    
    res.json({
      success: true,
      message: 'Link buttons created successfully!',
      boardName: board.name,
      linkColumn: linkColumn.title,
      columnId: linkColumn.id,
      itemsUpdated: results.length,
      totalItems: items.length,
      linkUrl: `https://d4fe9-service-4905568-eca6c204.us.monday.app/api/link-action`,
      availableColumns: columns.map(c => ({ title: c.title, type: c.type }))
    });
    
  } catch (error) {
    console.error('❌ Link button creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint to handle link button clicks
app.get('/api/link-action', async (req, res) => {
  try {
    const { itemId, action } = req.query;
    
    console.log(`🔗 Link button clicked:`)
    console.log(`   Item ID: ${itemId}`)
    console.log(`   Action: ${action}`)
    
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    const boardId = process.env.BOARD_ID || '9576217097';
    
    // First, get all groups in the board to find "Done" group
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
    console.log('📂 Available groups:', groupsResult.data.boards[0].groups);
    
    // Find "Done" group (case insensitive)
    const groups = groupsResult.data.boards[0].groups;
    const doneGroup = groups.find(group => 
      group.title.toLowerCase().includes('done') || 
      group.title.toLowerCase().includes('complete') ||
      group.title.toLowerCase().includes('finished')
    );
    
    let moveResult;
    let actionMessage = '';
    
    if (doneGroup) {
      console.log(`📁 Moving item to group: ${doneGroup.title} (${doneGroup.id})`);
      
      // Move item to Done group
      const moveQuery = `
        mutation {
          move_item_to_group(
            item_id: ${itemId}
            group_id: "${doneGroup.id}"
          ) {
            id
          }
        }
      `;
      
      moveResult = await monday.api(moveQuery);
      console.log('✅ Item moved successfully:', moveResult);
      actionMessage = `Item moved to "${doneGroup.title}" group successfully!`;
      
    } else {
      console.log('⚠️ No Done group found, available groups:', groups.map(g => g.title));
      
      // Fallback: Add a comment instead
      const commentQuery = `
        mutation {
          create_update(
            item_id: ${itemId}
            body: "🔗 Action clicked! (Note: No 'Done' group found to move item to)"
          ) {
          id
          }
        }
      `;
      
      moveResult = await monday.api(commentQuery);
      actionMessage = `No "Done" group found. Available groups: ${groups.map(g => g.title).join(', ')}`;
    }
    
    // Return a simple HTML response
    res.send(`
      <html>
        <head><title>Action Completed</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h2>✅ Action Completed!</h2>
          <p>Link button was clicked for item ID: <strong>${itemId}</strong></p>
          <p style="color: ${doneGroup ? 'green' : 'orange'};">${actionMessage}</p>
          ${!doneGroup ? '<p style="color: #666; font-size: 14px;">💡 Create a group with "Done", "Complete", or "Finished" in the name for automatic moving.</p>' : ''}
          <p style="margin-top: 30px;">
            <a href="#" onclick="window.close()">Close this window</a>
          </p>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ Link action error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h2>❌ Error</h2>
          <p>${error.message}</p>
          <p style="font-size: 14px; color: #666;">Check console for details</p>
        </body>
      </html>
    `);
  }
});

// API endpoint to delete all webhooks
app.post('/api/delete-webhooks', async (req, res) => {
  try {
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    const boardId = process.env.BOARD_ID || '9576217097';
    
    // Get all webhooks for this board
    const getWebhooksQuery = `
      query {
        webhooks(board_id: ${boardId}) {
          id
          event
        }
      }
    `;
    
    const webhooksResult = await monday.api(getWebhooksQuery);
    
    if (webhooksResult.errors) {
      return res.json({
        success: false,
        error: 'Failed to get webhooks',
        details: webhooksResult.errors.map(e => e.message).join(', ')
      });
    }
    
    const webhooks = webhooksResult.data.webhooks || [];
    console.log(`Found ${webhooks.length} webhooks to delete`);
    
    let deletedCount = 0;
    
    // Delete each webhook
    for (const webhook of webhooks) {
      try {
        const deleteQuery = `
          mutation {
            delete_webhook(id: ${webhook.id}) {
              id
            }
          }
        `;
        
        const deleteResult = await monday.api(deleteQuery);
        if (!deleteResult.errors) {
          deletedCount++;
          console.log(`✅ Deleted webhook ${webhook.id} (${webhook.event})`);
        } else {
          console.error(`❌ Failed to delete webhook ${webhook.id}:`, deleteResult.errors);
        }
      } catch (err) {
        console.error(`Error deleting webhook ${webhook.id}:`, err);
      }
    }
    
    res.json({
      success: true,
      deletedCount,
      totalFound: webhooks.length,
      message: `Deleted ${deletedCount} out of ${webhooks.length} webhooks`
    });
    
  } catch (error) {
    console.error('Error in delete webhooks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to show board columns and webhooks
app.get('/debug/board-structure', async (req, res) => {
  try {
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    const boardId = process.env.BOARD_ID || '9576217097';
    
    // Get board columns
    const columnsQuery = `
      query {
        boards(ids: [${boardId}]) {
          name
          columns {
            id
            title
            type
            settings_str
          }
          groups {
            id
            title
          }
        }
      }
    `;
    
    const columnsResult = await monday.api(columnsQuery);
    
    // Get existing webhooks
    const webhookQuery = `
      query {
        webhooks(board_id: ${boardId}) {
          id
          event
          config
        }
      }
    `;
    
    const webhookResult = await monday.api(webhookQuery);
    
    const board = columnsResult.data.boards[0];
    const statusColumns = board.columns.filter(col => col.type === 'color');
    
    res.json({
      success: true,
      boardName: board.name,
      boardId,
      allColumns: board.columns,
      statusColumns: statusColumns,
      groups: board.groups,
      existingWebhooks: webhookResult.data.webhooks,
      analysis: {
        totalColumns: board.columns.length,
        statusColumnCount: statusColumns.length,
        webhookCount: webhookResult.data.webhooks.length,
        statusColumnDetails: statusColumns.map(col => ({
          id: col.id,
          title: col.title,
          settings: col.settings_str
        }))
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to test Monday API connection
app.get('/debug/monday-api', async (req, res) => {
  try {
    const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
    const monday = mondaySdk({ token });
    const boardId = process.env.BOARD_ID || '9576217097';
    
    // Test 1: Get account info
    const accountQuery = `query { me { id name email } }`;
    const accountResult = await monday.api(accountQuery);
    
    // Test 2: Get board info  
    const boardQuery = `query { boards(ids: [${boardId}]) { id name permissions } }`;
    const boardResult = await monday.api(boardQuery);
    
    // Test 3: Check existing webhooks
    const webhookQuery = `query { webhooks(board_id: ${boardId}) { id event config } }`;
    const webhookResult = await monday.api(webhookQuery);
    
    res.json({
      success: true,
      debug: {
        account: accountResult,
        board: boardResult,
        existingWebhooks: webhookResult,
        tokenLength: token.length,
        boardId
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      debug: {
        errorType: error.name,
        fullError: error.toString()
      }
    });
  }
});

// Simple webhook handler
app.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 Webhook received:', JSON.stringify(req.body, null, 2));
    
    // Handle webhook challenge
    if (req.body.challenge) {
      return res.json({ challenge: req.body.challenge });
    }
    
    const { pulseName, pulseId, columnId, value, boardId, columnType } = req.body;
    
    // Check if status changed to Done
    if (columnType === 'color' || columnType === 'status') {
      const statusLabel = value?.label?.toLowerCase() || '';
      const isDone = statusLabel.includes('done') || statusLabel.includes('complete');
      
      if (isDone) {
        console.log(`✅ Moving ${pulseName} to Done group`);
        
        const token = process.env.MONDAY_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUzODQ1NDEzMCwiYWFpIjoxMSwidWlkIjoxMDkwNDA2NCwiaWFkIjoiMjAyNS0wNy0xM1QxODoyMzoxNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NDkwNTU2OCwicmduIjoidXNlMSJ9._U-8_uBJiW3rGR7hqPxT6S81e5ubaoWtxBhNSY_XyIk";
        const monday = mondaySdk({ token });
        
        // Get Done group
        const groupsResult = await monday.api(`
          query {
            boards(ids: [${boardId}]) {
              groups { id title }
            }
          }
        `);
        
        const doneGroup = groupsResult.data.boards[0].groups.find(g => 
          g.title.toLowerCase().includes('done')
        );
        
        if (doneGroup) {
          await monday.api(`
            mutation {
              move_item_to_group(item_id: ${pulseId}, group_id: "${doneGroup.id}") {
                id
              }
            }
          `);
          console.log(`✅ Moved ${pulseName} to ${doneGroup.title}`);
        }
      }
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Minimal Monday app running on port ${port}`);
  console.log(`📋 Board ID: ${process.env.BOARD_ID || '9576217097'}`);
  console.log(`🔗 Webhook URL: https://live1-service-4905568-eca6c204.us.monday.app/webhook`);
});