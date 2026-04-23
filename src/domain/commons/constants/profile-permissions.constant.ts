import { Permission } from '../enums/permission.enum';
import { UserProfile } from '../enums/user-profile.enum';

export const PROFILE_PERMISSIONS: Record<UserProfile, Permission[]> = {
  [UserProfile.ADMIN]: [
    Permission.EXAMS_READ,
    Permission.EXAMS_CREATE,
    Permission.EXAMS_UPDATE,
    Permission.EXAMS_DELETE,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_READ_OWN,
    Permission.APPOINTMENTS_UPDATE,
    Permission.APPOINTMENTS_DELETE,
    Permission.APPOINTMENTS_CANCEL_OWN,
    Permission.APPOINTMENTS_REQUEST_CHANGE_OWN,
    Permission.APPOINTMENTS_APPROVE_CHANGE,
  ],
  [UserProfile.CLIENT]: [
    Permission.EXAMS_READ,
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_READ_OWN,
    Permission.APPOINTMENTS_CANCEL_OWN,
    Permission.APPOINTMENTS_REQUEST_CHANGE_OWN,
  ],
};
