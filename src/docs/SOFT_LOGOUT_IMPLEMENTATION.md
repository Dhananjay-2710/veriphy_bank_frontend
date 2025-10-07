# Soft Logout Functionality Implementation

## Overview

The Veriphy Bank frontend now includes a comprehensive soft logout functionality that provides users with flexible logout options, session timeout warnings, and automatic session management. This implementation enhances security while improving user experience.

## Features

### 1. Soft Logout Modal (`SoftLogoutModal.tsx`)
- **Dual Logout Options**: Users can choose between soft logout (preserves session data) and hard logout (complete session termination)
- **User Information Display**: Shows current user details and session status
- **Security Notice**: Includes warnings about shared device usage
- **Switch User Option**: Allows users to switch accounts without full logout

### 2. Session Timeout Management (`useSessionManager.ts`)
- **Automatic Session Tracking**: Monitors user activity and session duration
- **Configurable Timeouts**: Default 30-minute session with 5-minute warning
- **Warning System**: Progressive warnings as session approaches expiry
- **Auto-Logout**: Automatic logout when session expires

### 3. Session Timeout Warning (`SessionTimeoutWarning.tsx`)
- **Countdown Timer**: Real-time countdown display
- **Progressive Warnings**: Visual indicators change based on time remaining
- **Extend Session**: One-click session extension
- **Auto-Logout**: Automatic logout when countdown reaches zero

### 4. Enhanced Authentication Context
- **Soft Logout Method**: New `softLogout()` function in AuthContext
- **Session State Management**: Tracks session timeouts and warnings
- **Data Preservation**: Maintains user preferences during soft logout

## Implementation Details

### File Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── SoftLogoutModal.tsx          # Main logout options modal
│   │   └── SessionTimeoutWarning.tsx    # Session timeout warning modal
│   ├── Layout/
│   │   ├── Header.tsx                   # Updated with soft logout integration
│   │   └── SessionTimeoutProvider.tsx   # Session timeout provider wrapper
│   └── Auth/
│       └── LoginPage.tsx                # Enhanced with soft logout session handling
├── hooks/
│   └── useSessionManager.ts             # Session management hook
├── contexts/
│   └── AuthContextFixed.tsx             # Enhanced with soft logout methods
└── App.tsx                              # Updated with SessionTimeoutProvider
```

### Key Components

#### 1. SoftLogoutModal
```typescript
interface SoftLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchUser?: () => void;
}
```

**Features:**
- Soft logout preserves session data for quick re-login
- Hard logout completely terminates session
- Switch user option for multi-user environments
- Security notices for shared devices

#### 2. SessionTimeoutWarning
```typescript
interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onExtendSession: () => void;
  timeRemaining: number; // in seconds
}
```

**Features:**
- Real-time countdown display
- Progressive warning levels (info, warning, critical)
- One-click session extension
- Automatic logout on expiry

#### 3. useSessionManager Hook
```typescript
interface SessionManagerOptions {
  timeoutMinutes?: number;      // Default: 30 minutes
  warningMinutes?: number;      // Default: 5 minutes
  onTimeout?: () => void;
  onWarning?: () => void;
}
```

**Features:**
- Configurable session timeout
- Automatic warning triggers
- Session extension capability
- Cleanup on unmount

## Usage

### Basic Implementation
The soft logout functionality is automatically integrated into the application through the `SessionTimeoutProvider` wrapper in `App.tsx`.

### Manual Session Management
```typescript
import { useSessionManager } from '../hooks/useSessionManager';

function MyComponent() {
  const { extendSession, resetSession, timeRemaining } = useSessionManager({
    timeoutMinutes: 45,
    warningMinutes: 10
  });

  // Use session management functions
}
```

### Soft Logout in Custom Components
```typescript
import { useAuth } from '../contexts/AuthContextFixed';

function MyComponent() {
  const { softLogout, logout } = useAuth();

  const handleSoftLogout = async () => {
    await softLogout(); // Preserves session data
  };

  const handleHardLogout = async () => {
    await logout(); // Complete session termination
  };
}
```

## Configuration

### Session Timeout Settings
Default configuration can be modified in `SessionTimeoutProvider.tsx`:

```typescript
const {
  timeRemaining,
  isWarning,
  isExpired,
  extendSession,
  resetSession
} = useSessionManager({
  timeoutMinutes: 30, // Session duration
  warningMinutes: 5,  // Warning before expiry
  onWarning: () => setShowWarning(true),
  onTimeout: () => setShowWarning(false)
});
```

### System Settings Integration
Session timeout can be configured through system settings:

```typescript
// Example: Get timeout from system settings
const sessionTimeout = await getSystemSetting('session_timeout_minutes');
const warningTimeout = await getSystemSetting('session_warning_minutes');
```

## Security Features

### 1. Data Protection
- **Soft Logout**: Preserves user preferences and session info
- **Hard Logout**: Complete data clearing for maximum security
- **Session Encryption**: Session data stored with encryption considerations

### 2. Automatic Cleanup
- **Timeout Cleanup**: Automatic session termination on inactivity
- **Memory Management**: Proper cleanup of timers and intervals
- **Storage Cleanup**: LocalStorage management on logout

### 3. Security Warnings
- **Shared Device Warnings**: Alerts for public/shared device usage
- **Session Expiry Notices**: Clear communication about session limits
- **Auto-Logout Protection**: Prevents unauthorized access after timeout

## User Experience

### 1. Seamless Integration
- **Non-Intrusive**: Session management works in background
- **User Control**: Users can extend sessions or logout manually
- **Quick Re-Login**: Soft logout enables faster subsequent logins

### 2. Visual Feedback
- **Progressive Warnings**: Visual indicators change based on urgency
- **Countdown Timers**: Clear time remaining display
- **Status Indicators**: Session status and user information display

### 3. Accessibility
- **Keyboard Navigation**: Full keyboard support for all modals
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Visual indicators work in all themes

## Browser Compatibility

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **Mobile Support**: Responsive design for mobile devices
- **LocalStorage**: Graceful degradation if LocalStorage unavailable

## Testing

### Manual Testing Checklist
- [ ] Soft logout preserves session data
- [ ] Hard logout clears all data
- [ ] Session timeout warning appears correctly
- [ ] Auto-logout works after timeout
- [ ] Session extension functions properly
- [ ] Switch user option works
- [ ] Mobile responsive design
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

### Automated Testing
```typescript
// Example test cases
describe('Soft Logout', () => {
  test('should preserve session data on soft logout', () => {
    // Test implementation
  });
  
  test('should clear all data on hard logout', () => {
    // Test implementation
  });
  
  test('should show warning before session expiry', () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **Session not extending**: Check if `extendSession` is properly called
2. **Warning not showing**: Verify `onWarning` callback is set
3. **Auto-logout not working**: Check timeout configuration
4. **Data not preserved**: Verify LocalStorage permissions

### Debug Information
Enable debug logging by setting:
```typescript
localStorage.setItem('debug_session', 'true');
```

## Future Enhancements

### Planned Features
1. **Multi-Device Session Management**: Sync sessions across devices
2. **Advanced Security**: Biometric authentication integration
3. **Session Analytics**: Track user session patterns
4. **Custom Timeouts**: Role-based session timeouts
5. **Session Recovery**: Resume sessions after browser crash

### Configuration Options
1. **User Preferences**: Allow users to set their own timeout preferences
2. **Role-Based Settings**: Different timeouts for different user roles
3. **Device-Specific Settings**: Different settings for mobile vs desktop
4. **Network-Based Settings**: Adjust timeouts based on network conditions

## Conclusion

The soft logout functionality provides a comprehensive solution for session management in the Veriphy Bank application. It balances security requirements with user experience needs, offering flexible logout options and proactive session management.

The implementation is modular, well-documented, and easily extensible for future enhancements. It integrates seamlessly with the existing authentication system while providing new capabilities for session management and security.
