// Fixed webhook handler with proper error checking and validation
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
        // First, get current item state to verify it's not already in Done group
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
        
        // Check for errors in item query
        if (itemResult.errors && itemResult.errors.length > 0) {
          console.error('❌ Error fetching item details:', itemResult.errors);
          return res.json({
            success: false,
            error: 'Failed to fetch item details',
            graphqlErrors: itemResult.errors
          });
        }
        
        const currentItem = itemResult.data?.items?.[0];
        if (!currentItem) {
          console.error('❌ Item not found:', pulseId);
          return res.json({
            success: false,
            error: 'Item not found',
            itemId: pulseId
          });
        }
        
        console.log(`📍 Current item location: ${currentItem.group.title} (${currentItem.group.id})`);
        
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
        
        // Check for errors in groups query
        if (groupsResult.errors && groupsResult.errors.length > 0) {
          console.error('❌ Error fetching groups:', groupsResult.errors);
          return res.json({
            success: false,
            error: 'Failed to fetch board groups',
            graphqlErrors: groupsResult.errors
          });
        }
        
        const groups = groupsResult.data?.boards?.[0]?.groups || [];
        
        // Find "Done" group (case insensitive)
        const doneGroup = groups.find(group => 
          group.title.toLowerCase().includes('done') || 
          group.title.toLowerCase().includes('complete') ||
          group.title.toLowerCase().includes('finished')
        );
        
        if (doneGroup) {
          // Check if item is already in Done group
          if (currentItem.group.id === doneGroup.id) {
            console.log(`ℹ️ Item already in Done group: ${doneGroup.title}`);
            return res.json({
              success: true,
              message: `Item already in Done group`,
              action: 'no_move_needed',
              itemId: pulseId,
              itemName: pulseName,
              currentGroup: doneGroup.title
            });
          }
          
          console.log(`📁 Moving item from "${currentItem.group.title}" to "${doneGroup.title}" (${doneGroup.id})`);
          
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
          
          // CRITICAL: Check for GraphQL errors in the response
          if (moveResult.errors && moveResult.errors.length > 0) {
            console.error('❌ GraphQL errors in move operation:', moveResult.errors);
            return res.json({
              success: false,
              error: 'Failed to move item - GraphQL errors',
              graphqlErrors: moveResult.errors,
              details: moveResult.errors.map(e => e.message).join(', '),
              itemId: pulseId,
              targetGroup: doneGroup.title
            });
          }
          
          // Validate the response has the expected data
          if (!moveResult.data || !moveResult.data.move_item_to_group) {
            console.error('❌ No data returned from move operation:', moveResult);
            return res.json({
              success: false,
              error: 'Move operation returned no data',
              response: moveResult,
              itemId: pulseId,
              targetGroup: doneGroup.title
            });
          }
          
          console.log('✅ Move operation response:', JSON.stringify(moveResult, null, 2));
          
          // Verify the move was successful
          const verifyQuery = `
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
          
          const verifyResult = await monday.api(verifyQuery);
          const movedItem = verifyResult.data?.items?.[0];
          
          if (movedItem && movedItem.group.id === doneGroup.id) {
            console.log(`✅ Verified: Item successfully moved to ${movedItem.group.title}`);
            
            res.json({
              success: true,
              message: `Automation triggered: ${actionReason}`,
              action: 'moved_to_done_group',
              itemId: pulseId,
              itemName: pulseName,
              fromGroup: currentItem.group.title,
              targetGroup: doneGroup.title,
              reason: actionReason,
              verified: true
            });
          } else {
            console.error(`❌ Verification failed: Item not in Done group after move`);
            console.error(`   Expected group: ${doneGroup.id}`);
            console.error(`   Actual group: ${movedItem?.group.id}`);
            
            res.json({
              success: false,
              error: 'Move appeared to succeed but verification failed',
              itemId: pulseId,
              expectedGroup: doneGroup.title,
              actualGroup: movedItem?.group.title,
              moveResponse: moveResult.data
            });
          }
          
        } else {
          console.log('⚠️ No Done group found for automation');
          res.json({
            success: true,
            message: `${actionReason} but no Done group found`,
            action: 'done_status_no_group',
            itemId: pulseId,
            itemName: pulseName,
            availableGroups: groups.map(g => g.title),
            suggestion: 'Create a group with "Done", "Complete", or "Finished" in the name'
          });
        }
        
      } catch (moveError) {
        console.error('❌ Error in move operation:', moveError);
        console.error('   Error details:', {
          name: moveError.name,
          message: moveError.message,
          stack: moveError.stack
        });
        
        res.json({
          success: false,
          error: `Failed to move item: ${moveError.message}`,
          errorType: moveError.name,
          reason: actionReason,
          itemId: pulseId
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
        itemName: pulseName,
        columnId: columnId,
        value: value
      });
    }
    
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    console.error('   Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.name
    });
  }
});