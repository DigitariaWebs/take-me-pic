/* Namespace: setx — extra strings for the settings domain screens.
   Covers: settings.tsx, notifications.tsx, messages.tsx, moi.tsx, CountryPickerModal.tsx */
const domain = {
  fr: {
    setx: {
      // settings.tsx — premium banner
      premiumTitle: 'Passe Première classe',
      premiumSub: 'plus de matchs · spots secrets · zéro pub',

      // settings.tsx — sign-out button & alert
      signOut: 'se déconnecter',
      signOutAlertTitle: 'Se déconnecter ?',
      signOutAlertConfirm: 'Se déconnecter',
      signOutAlertCancel: 'Annuler',

      // settings.tsx — app version line
      appVersion: 'Take Me Pic · v0.1 · beta',

      // settings.tsx — language values (covers ar + es additions)
      langFr: 'français',
      langEn: 'english',
      langAr: 'العربية',
      langEs: 'español',

      // notifications.tsx — filter chip labels
      filterAll: 'toutes',
      filterRequests: 'demandes',
      filterKarma: 'karma',
      filterCommunity: 'communauté',

      // notifications.tsx — unread headline & empty state
      allRead: 'tout lu ✓',
      emptyNotifs: 'Aucune notification dans cette catégorie.',

      // messages.tsx — filter chips
      msgFilterAll: 'tous',
      msgFilterActive: 'actifs',
      msgFilterArchived: 'archivés',

      // messages.tsx — search placeholder
      msgSearch: 'rechercher…',

      // messages.tsx — empty state
      msgEmpty: 'aucune conversation',

      // messages.tsx — action sheet actions
      msgMarkRead: 'marquer comme lu',
      msgArchive: 'archiver',
      msgDelete: 'supprimer',
      msgCancel: 'annuler',

      // messages.tsx — delete alert
      msgDeleteTitle: 'Supprimer la conversation',
      msgDeleteBody: 'Cette action est irréversible.',
      msgDeleteConfirm: 'Supprimer',
      msgDeleteCancel: 'Annuler',

      // moi.tsx — edit profile modal
      editProfileTitle: 'Éditer le profil',
      editNameLabel: 'Nom affiché',
      editNamePlaceholder: 'Ton prénom + initiale',
      editBioLabel: 'Bio',
      editBioPlaceholder: 'Quelques mots sur toi…',
      editSave: 'Sauvegarder',

      // moi.tsx — QR passport modal
      passportTitle: 'Mon passeport',
      passportScanCaption: 'scanner pour partager',
      passportBetaNote: 'ce QR sera activé à la sortie de la beta',

      // CountryPickerModal.tsx
      countryPickerTitle: 'indicatif du pays',
      countryPickerSearch: 'rechercher un pays…',

      // moi.tsx — role segmented control
      roleSeekerLabel: "je veux une photo",
      roleHelperLabel: "je veux aider",
      roleSwitchHint: "ton rôle actuel",

      // moi.tsx — role-aware stats card labels
      statsGiven: "photos prises",
      statsReceived: "photos reçues",
      appearance: "apparence",
      appearanceHint: "choisis ton ambiance",
      themeLight: "jour",
      themeDark: "nuit",

      // notifications.tsx — role-dependent request body
      notifRequestHelper: "{name} demande une photo à {dist}",
      notifRequestSeeker: "{name} a accepté de te prendre en photo",
    },
  },

  en: {
    setx: {
      premiumTitle: 'First Class Pass',
      premiumSub: 'more matches · secret spots · zero ads',

      signOut: 'sign out',
      signOutAlertTitle: 'Sign out?',
      signOutAlertConfirm: 'Sign out',
      signOutAlertCancel: 'Cancel',

      appVersion: 'Take Me Pic · v0.1 · beta',

      langFr: 'français',
      langEn: 'english',
      langAr: 'العربية',
      langEs: 'español',

      filterAll: 'all',
      filterRequests: 'requests',
      filterKarma: 'karma',
      filterCommunity: 'community',

      allRead: 'all read ✓',
      emptyNotifs: 'No notifications in this category.',

      msgFilterAll: 'all',
      msgFilterActive: 'active',
      msgFilterArchived: 'archived',

      msgSearch: 'search…',

      msgEmpty: 'no conversations',

      msgMarkRead: 'mark as read',
      msgArchive: 'archive',
      msgDelete: 'delete',
      msgCancel: 'cancel',

      msgDeleteTitle: 'Delete conversation',
      msgDeleteBody: 'This action cannot be undone.',
      msgDeleteConfirm: 'Delete',
      msgDeleteCancel: 'Cancel',

      editProfileTitle: 'Edit profile',
      editNameLabel: 'Display name',
      editNamePlaceholder: 'Your first name + initial',
      editBioLabel: 'Bio',
      editBioPlaceholder: 'A few words about you…',
      editSave: 'Save',

      passportTitle: 'My passport',
      passportScanCaption: 'scan to share',
      passportBetaNote: 'this QR will be activated after beta',

      countryPickerTitle: 'country code',
      countryPickerSearch: 'search a country…',

      // moi.tsx — role segmented control
      roleSeekerLabel: "I want a photo",
      roleHelperLabel: "I want to help",
      roleSwitchHint: "your current role",

      // moi.tsx — role-aware stats card labels
      statsGiven: "photos taken",
      statsReceived: "photos received",
      appearance: "appearance",
      appearanceHint: "pick your mood",
      themeLight: "day",
      themeDark: "night",

      // notifications.tsx — role-dependent request body
      notifRequestHelper: "{name} requests a photo at {dist}",
      notifRequestSeeker: "{name} accepted to take your photo",
    },
  },

  ar: {
    setx: {
      premiumTitle: 'تصريح الدرجة الأولى',
      premiumSub: 'مزيد من التطابقات · مواقع سرية · بدون إعلانات',

      signOut: 'تسجيل الخروج',
      signOutAlertTitle: 'تسجيل الخروج؟',
      signOutAlertConfirm: 'تسجيل الخروج',
      signOutAlertCancel: 'إلغاء',

      appVersion: 'Take Me Pic · v0.1 · beta',

      langFr: 'français',
      langEn: 'english',
      langAr: 'العربية',
      langEs: 'español',

      filterAll: 'الكل',
      filterRequests: 'الطلبات',
      filterKarma: 'الكارما',
      filterCommunity: 'المجتمع',

      allRead: 'الكل مقروء ✓',
      emptyNotifs: 'لا توجد إشعارات في هذه الفئة.',

      msgFilterAll: 'الكل',
      msgFilterActive: 'نشطة',
      msgFilterArchived: 'مؤرشفة',

      msgSearch: 'بحث…',

      msgEmpty: 'لا توجد محادثات',

      msgMarkRead: 'تحديد كمقروء',
      msgArchive: 'أرشفة',
      msgDelete: 'حذف',
      msgCancel: 'إلغاء',

      msgDeleteTitle: 'حذف المحادثة',
      msgDeleteBody: 'لا يمكن التراجع عن هذا الإجراء.',
      msgDeleteConfirm: 'حذف',
      msgDeleteCancel: 'إلغاء',

      editProfileTitle: 'تعديل الملف الشخصي',
      editNameLabel: 'الاسم المعروض',
      editNamePlaceholder: 'اسمك الأول + الحرف الأول',
      editBioLabel: 'نبذة',
      editBioPlaceholder: 'بضع كلمات عنك…',
      editSave: 'حفظ',

      passportTitle: 'جواز سفري',
      passportScanCaption: 'امسح للمشاركة',
      passportBetaNote: 'سيتم تفعيل هذا الرمز بعد انتهاء الإصدار التجريبي',

      countryPickerTitle: 'رمز البلد',
      countryPickerSearch: 'ابحث عن دولة…',

      // moi.tsx — role segmented control
      roleSeekerLabel: "أريد صورة",
      roleHelperLabel: "أريد المساعدة",
      roleSwitchHint: "دورك الحالي",

      // moi.tsx — role-aware stats card labels
      statsGiven: "صور التقطتها",
      statsReceived: "صور استقبلتها",
      appearance: "المظهر",
      appearanceHint: "اختر أجواءك",
      themeLight: "نهار",
      themeDark: "ليل",

      // notifications.tsx — role-dependent request body
      notifRequestHelper: "{name} يطلب صورة على بُعد {dist}",
      notifRequestSeeker: "{name} وافق على تصويرك",
    },
  },

  es: {
    setx: {
      premiumTitle: 'Pase Primera clase',
      premiumSub: 'más coincidencias · spots secretos · sin anuncios',

      signOut: 'cerrar sesión',
      signOutAlertTitle: '¿Cerrar sesión?',
      signOutAlertConfirm: 'Cerrar sesión',
      signOutAlertCancel: 'Cancelar',

      appVersion: 'Take Me Pic · v0.1 · beta',

      langFr: 'français',
      langEn: 'english',
      langAr: 'العربية',
      langEs: 'español',

      filterAll: 'todas',
      filterRequests: 'solicitudes',
      filterKarma: 'karma',
      filterCommunity: 'comunidad',

      allRead: 'todo leído ✓',
      emptyNotifs: 'Sin notificaciones en esta categoría.',

      msgFilterAll: 'todos',
      msgFilterActive: 'activos',
      msgFilterArchived: 'archivados',

      msgSearch: 'buscar…',

      msgEmpty: 'sin conversaciones',

      msgMarkRead: 'marcar como leído',
      msgArchive: 'archivar',
      msgDelete: 'eliminar',
      msgCancel: 'cancelar',

      msgDeleteTitle: 'Eliminar conversación',
      msgDeleteBody: 'Esta acción es irreversible.',
      msgDeleteConfirm: 'Eliminar',
      msgDeleteCancel: 'Cancelar',

      editProfileTitle: 'Editar perfil',
      editNameLabel: 'Nombre visible',
      editNamePlaceholder: 'Tu nombre + inicial',
      editBioLabel: 'Bio',
      editBioPlaceholder: 'Algunas palabras sobre ti…',
      editSave: 'Guardar',

      passportTitle: 'Mi pasaporte',
      passportScanCaption: 'escanear para compartir',
      passportBetaNote: 'este QR se activará al salir de la beta',

      countryPickerTitle: 'indicativo del país',
      countryPickerSearch: 'buscar un país…',

      // moi.tsx — role segmented control
      roleSeekerLabel: "quiero una foto",
      roleHelperLabel: "quiero ayudar",
      roleSwitchHint: "tu rol actual",

      // moi.tsx — role-aware stats card labels
      statsGiven: "fotos tomadas",
      statsReceived: "fotos recibidas",
      appearance: "apariencia",
      appearanceHint: "elige tu ambiente",
      themeLight: "día",
      themeDark: "noche",

      // notifications.tsx — role-dependent request body
      notifRequestHelper: "{name} pide una foto a {dist}",
      notifRequestSeeker: "{name} aceptó tomarte una foto",
    },
  },
};

export default domain;
