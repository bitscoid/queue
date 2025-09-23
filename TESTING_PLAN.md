# Testing Plan: Queue Calling Functionality for Operators

## Test Scenarios

### 1. Navigation and Menu
- [ ] Operators can see "Panggil Antrian" in the main navigation menu
- [ ] Operators can access their assigned queue from the "Daftar Loket" page
- [ ] Non-admin operators only see their assigned queue

### 2. Queue Display
- [ ] Operators can see their assigned queue information clearly on the calls page
- [ ] Queue information includes code, name, and ticket prefix
- [ ] Visual indicator shows which queue is assigned to the operator

### 3. Ticket Calling Functionality
- [ ] Operators can call the next ticket in the queue
- [ ] Operators can complete a called ticket
- [ ] Operators can skip a called ticket
- [ ] Operators can recall a called ticket
- [ ] Visual notifications appear for each action
- [ ] Audio notifications play when calling/recalling tickets

### 4. Real-time Updates
- [ ] WebSocket connection status is displayed
- [ ] Ticket status updates in real-time across multiple operator sessions
- [ ] Queue statistics update automatically

### 5. Responsive Design
- [ ] Calls page is usable on mobile devices
- [ ] All buttons and controls are accessible on small screens
- [ ] Layout adapts to different screen sizes

### 6. Error Handling
- [ ] Appropriate error messages are shown for network issues
- [ ] Error messages are shown when no tickets are available
- [ ] Appropriate feedback is provided for all user actions

## Test Data Setup

1. Create at least 2 queues with different names and prefixes
2. Create at least 3 operators with assigned queues
3. Generate several test tickets for each queue
4. Set up different ticket statuses (pending, serving, completed)

## Expected Results

- Operators can efficiently manage their assigned queues
- All actions provide clear feedback to the user
- Real-time updates work correctly across multiple sessions
- Mobile operators can use all functionality without issues