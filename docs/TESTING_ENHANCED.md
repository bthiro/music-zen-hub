# Testing Guide - Enhanced Music Zen Hub

## Agenda & Google Calendar Testing

### Calendar Integration
1. **Connect Google Calendar**
   - Navigate to `/app/agenda`
   - Click "Conectar Google Calendar"
   - Complete OAuth flow
   - Verify connection status shows "Google conectado"

2. **Calendar Views**
   - Test month/week/day views in FullCalendar
   - Navigate between months using prev/next buttons
   - Verify events display correctly in all views

3. **Event Creation**
   - Click on empty date to create new event
   - Fill event details and select student (optional)
   - Save and verify event appears in calendar
   - Check if Meet link is generated for Google events

4. **Event Editing**
   - Click on existing event
   - Modify details and save
   - Verify changes sync to Google Calendar

5. **Drag & Drop**
   - Drag events to different dates/times
   - Confirm changes are saved to database
   - Verify Google Calendar sync if connected

### Meet Link Generation
1. **Create Class with Google Connected**
   - Create new aula in `/app/agenda`
   - Verify Meet link is generated and saved
   - Test Meet link functionality
   - Check `aulas.meet_link` and `aulas.google_event_id` fields

2. **Sync Existing Classes**
   - Navigate to Google Calendar integration section
   - Click "Sincronizar" on existing classes
   - Verify Meet links are created and working

## Professor Profile Testing

### Profile Management
1. **Navigate to Profile**
   - Go to `/app/perfil`
   - Verify all current data loads correctly

2. **Edit Personal Information**
   - Click "Editar Perfil"
   - Update name, phone, bio, specialties
   - Save and verify persistence after F5

3. **Avatar Upload**
   - Upload new profile picture (test file size/type validation)
   - Verify image displays correctly
   - Check file is stored in `avatars` bucket

4. **Payment Settings**
   - Update PIX key
   - Modify billing message template
   - Test variable substitution preview
   - Verify persistence in database

5. **Password Management**
   - Click "Alterar Senha"
   - Enter new password and confirmation
   - Verify password change works
   - Test login with new password

### Integration Status
1. **Google Calendar Status**
   - Verify connection status display
   - Test connect/disconnect functionality
   - Confirm email display when connected

2. **Mercado Pago Status**
   - Check integration status badge
   - Verify professor-specific configuration

## Settings Persistence Testing

### Configuration Management
1. **Navigate to Settings**
   - Go to `/app/configuracoes`
   - Verify current settings load from database

2. **Update Settings**
   - Change timezone, PIX key, payment link
   - Modify billing message
   - Toggle notifications
   - Click "Salvar Configurações"

3. **Persistence Verification**
   - Refresh page (F5)
   - Verify all settings persist from database
   - Check `configuracoes_professor` table

4. **Google Integration**
   - Test connect/disconnect in settings
   - Verify integration test functionality

## Enhanced Payment System Testing

### Automatic Payments (Mercado Pago)
1. **Create Payment Link**
   - Navigate to `/app/pagamentos`
   - Create new payment for student
   - Generate Mercado Pago link
   - Verify link uses professor's tokens

2. **Payment Flow**
   - Complete payment via Mercado Pago (test mode)
   - Verify webhook updates status to 'pago'
   - Check `eligible_to_schedule` becomes true
   - Verify "Agendar Aulas" button appears

### Manual Payment Marking
1. **Mark Payment as Manual**
   - Find pending payment
   - Click "Marcar como pago (manual)"
   - Enter reason (e.g., "PIX direto")
   - Verify payment status updates

2. **Idempotency Test**
   - Try to mark already paid payment again
   - Verify system blocks duplicate marking
   - Check appropriate error message

3. **Precedence Rules**
   - Mark payment as manual
   - Simulate webhook for same payment
   - Verify manual status is not overridden

### Payment Status Precedence
1. **Refund/Cancel Testing**
   - Simulate refund webhook
   - Verify status changes to 'cancelado'
   - Check `eligible_to_schedule` becomes false
   - Confirm precedence set to 'refunded'

2. **Chargeback Simulation**
   - Simulate chargeback webhook
   - Verify proper status update
   - Check alert notification appears

### Multi-Tenant Isolation
1. **Create Multiple Professors**
   - Admin creates Professor A and B
   - Each connects own Google/Mercado Pago

2. **Payment Isolation Test**
   - Professor A creates payment
   - Professor B cannot see A's payments
   - Verify webhook routes to correct professor

3. **Google Calendar Isolation**
   - Each professor connects own Google
   - Verify events don't cross between accounts
   - Test Meet link generation per professor

## Security & RLS Testing

### Row Level Security
1. **Professor Data Isolation**
   - Login as Professor A
   - Verify only sees own students/classes/payments
   - Cannot access Professor B's data

2. **Admin Global Access**
   - Login as admin
   - Verify can see all professors' data
   - Test impersonation functionality (if implemented)

3. **Profile Updates**
   - Professor can update own profile
   - Cannot update other professors' data
   - Admin can update any profile

### Storage Security
1. **Avatar Upload**
   - Test upload permissions
   - Verify file naming/path security
   - Check public URL generation
   - Test file size/type restrictions

## Route & Menu Testing

### Navigation Structure
1. **Professor Routes**
   - Test all `/app/*` routes work correctly
   - Verify module-based access control
   - Check menu items match enabled modules

2. **New Routes**
   - `/app/agenda` - FullCalendar interface
   - `/app/perfil` - Professor profile
   - `/app/pagamentos` - Enhanced payments

3. **Admin Routes**
   - Verify admin has separate menu
   - Test professor management functions
   - Check global payment monitoring

## Database Schema Testing

### New Fields Verification
1. **Professores Table**
   - `avatar_url` - stores avatar file path
   - `pix_key` - PIX payment key
   - `billing_text` - custom billing message
   - `payment_preference` - JSON payment settings

2. **Aulas Table**
   - `google_event_id` - Google Calendar event ID
   - `meet_link` - Generated Meet URL

3. **Pagamentos Table**
   - `manual_payment_reason` - reason for manual marking
   - `manual_payment_by` - who marked manually
   - `manual_payment_at` - when marked manually
   - `payment_precedence` - precedence level

## Error Handling Testing

### Google Calendar Errors
1. **Token Expiry**
   - Simulate expired Google token
   - Verify proper error handling
   - Test re-authentication flow

2. **API Failures**
   - Simulate Google API errors
   - Verify local operations continue
   - Check "tentar novamente" functionality

### Payment Error Scenarios
1. **Mercado Pago Failures**
   - Simulate MP API failures
   - Verify graceful degradation
   - Test manual fallback options

2. **Webhook Processing**
   - Test malformed webhook data
   - Verify invalid reference handling
   - Check duplicate processing prevention

## Performance Testing

### Calendar Loading
1. **Large Event Sets**
   - Create many events (50+)
   - Test calendar rendering performance
   - Verify pagination/lazy loading

2. **Sync Operations**
   - Test bulk Google Calendar sync
   - Verify UI remains responsive
   - Check loading indicators

### File Upload Performance
1. **Avatar Upload**
   - Test various file sizes
   - Verify upload progress indication
   - Check compression if implemented

## Integration Testing Checklist

- [ ] Google Calendar connection works
- [ ] Meet links generate correctly  
- [ ] Calendar events sync bidirectionally
- [ ] Professor profile saves and persists
- [ ] Avatar upload works with proper validation
- [ ] Settings persist to database correctly
- [ ] Manual payment marking works with idempotency
- [ ] Automatic payments flow through MP webhook
- [ ] Payment precedence rules enforced
- [ ] Multi-tenant isolation confirmed
- [ ] RLS policies working correctly
- [ ] All new routes accessible with proper modules
- [ ] Error handling graceful for all scenarios
- [ ] Performance acceptable with realistic data volumes

## QA Completion Criteria

### All acceptance criteria must pass:
1. ✅ Calendar displays aulas + Google events with month/week/day views
2. ✅ Meet links generate properly and save to database
3. ✅ Professor profile allows complete management of personal data
4. ✅ Settings persist to database and survive page refresh
5. ✅ Dual payment modes work: manual marking + automatic MP webhook
6. ✅ Payment precedence rules prevent data corruption
7. ✅ Multi-tenant isolation ensures no data leakage
8. ✅ RLS policies enforce proper data access
9. ✅ All routes work with module-based access control
10. ✅ Error handling is user-friendly and non-blocking

### Documentation Updated:
- [ ] This testing guide covers all new features
- [ ] README includes setup instructions for Google/MP
- [ ] API documentation reflects new endpoints
- [ ] Security guidelines documented for multi-tenant setup