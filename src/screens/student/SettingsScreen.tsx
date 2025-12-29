import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from '@react-native-documents/picker';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useLanguageStore } from '../../lib/stores/useLanguageStore';
import { useMockModeStore } from '../../lib/stores/useMockModeStore';
import { useAuthStore } from '../../lib/stores/useAuthStore';
import { locales } from '../../lib/i18n/config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from '../../navigation/AppNavigator';
import { usePrintProgressStore } from '../../lib/stores/usePrintProgressStore';
import { useUploadFile } from '../../lib/api/services/studentFiles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../../config/env';

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme, themeMode, setThemeMode } = useTheme();
  const { locale, setLocale } = useLanguageStore();
  const { isMockMode } = useMockModeStore();
  const { user, setUser } = useAuthStore();
  const navigation = useNavigation();
  const themeColors = colors[theme];
  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(false);
  const [versionTapCount, setVersionTapCount] = React.useState(0);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    uri: string;
    sizeKb: number;
    sizeMb: number;
    extension: string;
  } | null>(null);
  const uploadFileMutation = useUploadFile();
  const [uploadDebugInfo, setUploadDebugInfo] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    usedMethod?: 'axios' | 'xhr' | 'fetch';
    request?: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      body?: any;
      timestamp: string;
    };
    completeInput?: {
      endpoint: string;
      fullUrl: string;
      method: string;
      headers: Record<string, string>;
      body: any;
      metadata: any;
    };
    response?: {
      status: number;
      statusText: string;
      headers?: Record<string, string>;
      data?: any;
      timestamp: string;
    };
    error?: {
      message: string;
      code?: string;
      type?: 'network' | 'timeout' | 'ssl' | 'server' | 'formdata' | 'unknown';
      diagnosis?: string;
      allErrors?: any;
      response?: {
        status: number;
        data: any;
      };
      timestamp: string;
    };
    duration?: number;
  }>({ status: 'idle' });

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
            <Text
              style={[
                styles.headerTitle,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.settings.title')}
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('student.settings.description')}
            </Text>
        </View>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('student.settings.appearance.title')}
                </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.settings.appearance.description')}
                </Text>
              </View>
            </View>
            <Select
              value={themeMode}
              onChange={(value: string) => setThemeMode(value as 'light' | 'dark' | 'system')}
              options={[
                { label: t('student.settings.appearance.lightTitle'), value: 'light' },
                { label: t('student.settings.appearance.darkTitle'), value: 'dark' },
                { label: t('student.settings.appearance.systemTitle'), value: 'system' },
              ]}
              placeholder={t('student.printers.selectTheme')}
              style={styles.themeSelect}
            />
          </CardContent>
        </Card>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.settings.language.title', 'Language')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.settings.language.description', 'Choose your preferred language')}
                </Text>
              </View>
            </View>
            <Select
              value={locale}
              onChange={(value: string) => setLocale(value as 'en' | 'vi')}
              options={locales.map(loc => ({
                label: loc === 'en' 
                  ? t('student.settings.language.englishTitle')
                  : t('student.settings.language.vietnameseTitle'),
                value: loc,
              }))}
              placeholder={t('student.printers.selectLanguage')}
              style={styles.languageSelect}
            />
          </CardContent>
        </Card>

        {isMockMode && (
          <Card style={styles.settingsCard}>
            <CardHeader>
              <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('student.settings.mockMode.title', 'Mock Mode')}
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {t('student.settings.mockMode.description', 'Switch between Student and Staff views in mock mode')}
                  </Text>
                </View>
              </View>
              <Select
                value={user?.userType || 'student'}
                onChange={(value: string) => {
                  if (user) {
                    setUser({
                      ...user,
                      userType: value as 'student' | 'staff',
                    });
                    // Navigate to force re-render
                    setTimeout(() => {
                      if (navigationRef.isReady()) {
                        navigationRef.reset({
                          index: 0,
                          routes: [{ name: value === 'staff' ? 'StaffTabs' : 'StudentTabs' }],
                        });
                      }
                    }, 100);
                  }
                }}
                options={[
                  { label: t('student.settings.mockMode.student', 'Student'), value: 'student' },
                  { label: t('student.settings.mockMode.staff', 'Staff'), value: 'staff' },
                ]}
                placeholder={t('student.settings.mockMode.selectRole', 'Select Role')}
                style={styles.roleSelect}
              />
            </CardContent>
          </Card>
        )}

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.settings.notifications.title')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('student.settings.notifications.push')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.settings.notifications.pushDescription')}
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: themeColors.muted,
                  true: themeColors.primary,
                }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('student.settings.notifications.email')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.settings.notifications.emailDescription')}
                </Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{
                  false: themeColors.muted,
                  true: themeColors.primary,
                }}
              />
            </View>
          </CardContent>
        </Card>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.settings.account.title')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                },
              ]}
            >
              <Text
                style={[
                  styles.settingLabel,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.settings.account.changePassword')}
              </Text>
              <ChevronRight
                size={20}
                color={themeColors['muted-foreground']}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </CardContent>
        </Card>

        {/* Test Upload File Component - Temporary */}
        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                Test Upload File (Temporary)
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Test file picker, upload file and debug API calls.
                </Text>
              </View>
            </View>
            <Button
              title="Chọn File"
              onPress={async () => {
                try {
                  const result = await DocumentPicker.pick({
                    type: [
                      DocumentPicker.types.pdf,
                      DocumentPicker.types.doc,
                      DocumentPicker.types.docx,
                      DocumentPicker.types.images,
                    ],
                  });

                  if (result && result[0]) {
                    const file = result[0];
                    const fileSizeKb = Math.round((file.size || 0) / 1024);
                    const fileSizeMb = Math.round((file.size || 0) / (1024 * 1024) * 100) / 100;
                    const extension = file.name?.split('.').pop()?.toUpperCase() || 'UNKNOWN';

                    const fileInfo = {
                      name: file.name || 'document',
                      size: file.size || 0,
                      type: file.type || 'application/octet-stream',
                      uri: file.uri,
                      sizeKb: fileSizeKb,
                      sizeMb: fileSizeMb,
                      extension: extension,
                    };

                    setSelectedFile(fileInfo);

                    // Debug log to console
                    console.log('📁 [TEST UPLOAD] File Selected:');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('📄 File Name:', fileInfo.name);
                    console.log('📊 File Size:', {
                      bytes: fileInfo.size.toLocaleString('vi-VN'),
                      kb: `${fileInfo.sizeKb.toLocaleString('vi-VN')} KB`,
                      mb: `${fileInfo.sizeMb} MB`,
                    });
                    console.log('🏷️  File Type:', fileInfo.type);
                    console.log('📎 Extension:', fileInfo.extension);
                    console.log('🔗 URI:', fileInfo.uri);
                    console.log('📋 Full File Object:', JSON.stringify({
                      name: fileInfo.name,
                      size: fileInfo.size,
                      type: fileInfo.type,
                      uri: fileInfo.uri.substring(0, 50) + '...',
                      sizeKb: fileInfo.sizeKb,
                      sizeMb: fileInfo.sizeMb,
                      extension: fileInfo.extension,
                    }, null, 2));
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  }
                } catch (err: any) {
                  const isCanceled = err?.code === 'DOCUMENT_PICKER_CANCELED' || 
                                    err?.message?.toLowerCase().includes('cancel');
                  
                  if (!isCanceled) {
                    console.error('❌ [TEST UPLOAD] Error picking file:', err);
                  }
                }
              }}
              style={styles.testUploadButton}
            />
            
            {selectedFile && (
              <View
                style={[
                  styles.fileInfoContainer,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fileInfoTitle,
                    { color: themeColors.foreground },
                  ]}
                >
                  File Information:
                </Text>
                <View style={styles.fileInfoRow}>
                  <Text
                    style={[
                      styles.fileInfoLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Name:
                  </Text>
                  <Text
                    style={[
                      styles.fileInfoValue,
                      { color: themeColors.foreground },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {selectedFile.name}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text
                    style={[
                      styles.fileInfoLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Size:
                  </Text>
                  <Text
                    style={[
                      styles.fileInfoValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {selectedFile.sizeKb} KB ({selectedFile.sizeMb} MB)
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text
                    style={[
                      styles.fileInfoLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Type:
                  </Text>
                  <Text
                    style={[
                      styles.fileInfoValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {selectedFile.type}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text
                    style={[
                      styles.fileInfoLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Extension:
                  </Text>
                  <Text
                    style={[
                      styles.fileInfoValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {selectedFile.extension}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text
                    style={[
                      styles.fileInfoLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    URI:
                  </Text>
                  <Text
                    style={[
                      styles.fileInfoValue,
                      { color: themeColors.foreground },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {selectedFile.uri}
                  </Text>
                </View>
              </View>
            )}

            {selectedFile && (
              <Button
                title={uploadFileMutation.isPending ? "Đang tải lên..." : "Tải File Lên"}
                onPress={async () => {
                  const startTime = Date.now();
                  setUploadDebugInfo({ status: 'uploading' });

                  // Get token from storage
                  let token: string | null = null;
                  try {
                    const authStorage = await AsyncStorage.getItem('auth-storage');
                    if (authStorage) {
                      const parsed = JSON.parse(authStorage);
                      token = parsed.state?.token || null;
                    }
                  } catch (error) {
                    console.error('Error getting token:', error);
                  }

                  // Get base URL and construct full URL (matching apiClient logic)
                  let baseUrl = ENV.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
                  let endpoint = '/students/files/upload';
                  
                  // Apply same logic as apiClient.uploadFile
                  if (baseUrl.endsWith('/api') && endpoint.startsWith('/api')) {
                    endpoint = endpoint.substring(4);
                  } else if (!baseUrl.endsWith('/api') && !endpoint.startsWith('/api')) {
                    endpoint = `/api${endpoint}`;
                  }
                  
                  const fullUrl = `${baseUrl}${endpoint}`;

                  // Prepare FormData
                  const formData = new FormData();
                  const fileObject = {
                    uri: selectedFile.uri,
                    type: selectedFile.type || 'application/octet-stream',
                    name: selectedFile.name,
                  };
                  formData.append('file', fileObject as any);

                  // Prepare complete request info with all data
                  const completeRequestInfo = {
                    endpoint: '/students/files/upload',
                    fullUrl: fullUrl,
                    method: 'POST',
                    headers: {
                      'Authorization': token ? `Bearer ${token}` : 'NOT_SET',
                      'Content-Type': 'multipart/form-data',
                      // Note: React Native will set Content-Type with boundary automatically
                    },
                    body: {
                      formData: {
                        fieldName: 'file',
                        file: {
                          uri: selectedFile.uri,
                          type: selectedFile.type || 'application/octet-stream',
                          name: selectedFile.name,
                          size: selectedFile.size,
                          sizeKb: selectedFile.sizeKb,
                          sizeMb: selectedFile.sizeMb,
                          extension: selectedFile.extension,
                        },
                      },
                    },
                    metadata: {
                      timestamp: new Date().toISOString(),
                      hasToken: !!token,
                      tokenLength: token?.length || 0,
                      baseUrl: baseUrl,
                    },
                  };

                  // Prepare request info for UI
                  const requestInfo = {
                    url: '/students/files/upload',
                    method: 'POST',
                    headers: {
                      'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'NOT_SET',
                      'Content-Type': 'multipart/form-data',
                    },
                    body: {
                      file: {
                        uri: selectedFile.uri.substring(0, 50) + '...',
                        type: selectedFile.type,
                        name: selectedFile.name,
                      },
                    },
                    timestamp: new Date().toISOString(),
                  };

                  setUploadDebugInfo(prev => ({
                    ...prev,
                    request: requestInfo,
                    completeInput: completeRequestInfo,
                  }));

                  // Log complete JSON input to console
                  console.log('📋 [API INPUT] Complete JSON Input for API Team:');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log(JSON.stringify(completeRequestInfo, null, 2));
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  
                  // Also log formatted for readability
                  console.log('🚀 [UPLOAD DEBUG] Starting Upload:');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('📤 REQUEST DETAILS:');
                  console.log('  Endpoint:', completeRequestInfo.endpoint);
                  console.log('  Full URL:', completeRequestInfo.fullUrl);
                  console.log('  Method:', completeRequestInfo.method);
                  console.log('  Headers:', JSON.stringify(completeRequestInfo.headers, null, 2));
                  console.log('  Body:', JSON.stringify(completeRequestInfo.body, null, 2));
                  console.log('  Metadata:', JSON.stringify(completeRequestInfo.metadata, null, 2));
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                  uploadFileMutation.mutate(
                    {
                      uri: selectedFile.uri,
                      type: selectedFile.type,
                      name: selectedFile.name,
                    },
                    {
                      onSuccess: (response) => {
                        const duration = Date.now() - startTime;
                        const responseInfo = {
                          status: response.status,
                          statusText: response.statusText,
                          headers: response.headers as Record<string, string>,
                          data: response.data,
                          timestamp: new Date().toISOString(),
                        };

                        setUploadDebugInfo({
                          status: 'success',
                          usedMethod: (response as any).usedMethod || 'axios',
                          request: requestInfo,
                          response: responseInfo,
                          duration,
                        });

                        // Log response to console
                        console.log('✅ [UPLOAD DEBUG] Upload Success:');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('📥 RESPONSE:');
                        console.log('  Status:', responseInfo.status);
                        console.log('  Status Text:', responseInfo.statusText);
                        console.log('  Headers:', JSON.stringify(responseInfo.headers, null, 2));
                        console.log('  Data:', JSON.stringify(responseInfo.data, null, 2));
                        console.log('  Duration:', `${duration}ms`);
                        console.log('  Timestamp:', responseInfo.timestamp);
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      },
                      onError: (error: any) => {
                        const duration = Date.now() - startTime;
                        
                        // Diagnose error type
                        let errorType: 'network' | 'timeout' | 'ssl' | 'server' | 'formdata' | 'unknown' = 'unknown';
                        let diagnosis = '';
                        
                        // Check error code and message
                        const errorCode = error?.code || '';
                        const errorMessage = error?.message || '';
                        const isNetworkError = errorCode === 'ERR_NETWORK' || errorMessage.includes('Network') || errorMessage.includes('status 0');
                        const isTimeout = errorCode === 'ECONNABORTED' || errorMessage.includes('timeout');
                        const isSSLError = errorCode?.includes('CERT') || errorCode?.includes('SSL') || errorMessage.includes('certificate');
                        const hasResponse = !!error?.response;
                        const isFormDataIssue = errorMessage.includes('status 0') && !hasResponse;
                        
                        if (isSSLError) {
                          errorType = 'ssl';
                          diagnosis = 'SSL Certificate Error - Certificate validation failed. Check Heroku SSL certificate or network security config.';
                        } else if (isTimeout) {
                          errorType = 'timeout';
                          diagnosis = 'Request Timeout - Server took too long to respond. File may be too large or server is slow.';
                        } else if (hasResponse && error.response.status >= 400) {
                          errorType = 'server';
                          diagnosis = `Server Error (${error.response.status}) - API server returned an error. Check response data for details.`;
                        } else if (isFormDataIssue) {
                          errorType = 'formdata';
                          diagnosis = 'FormData Serialization Issue - React Native FormData polyfill may have serialized incorrectly. Try using axios method.';
                        } else if (isNetworkError) {
                          errorType = 'network';
                          diagnosis = 'Network Error - Cannot connect to server. Possible causes:\n1. Heroku app is sleeping (free tier)\n2. Network connection issue\n3. API URL incorrect\n4. Firewall blocking request';
                        } else {
                          errorType = 'unknown';
                          diagnosis = 'Unknown Error - Check error details below for more information.';
                        }
                        
                        const errorInfo = {
                          message: error?.message || 'Unknown error',
                          code: error?.code,
                          type: errorType,
                          diagnosis: diagnosis,
                          allErrors: error?.allErrors,
                          response: error?.response
                            ? {
                                status: error.response.status,
                                data: error.response.data,
                              }
                            : undefined,
                          timestamp: new Date().toISOString(),
                        };

                        setUploadDebugInfo({
                          status: 'error',
                          usedMethod: error?.usedMethod || (error?.allErrors ? 'axios' : undefined),
                          request: requestInfo,
                          error: errorInfo,
                          duration,
                        });

                        // Log detailed error analysis to console
                        console.error('❌ [UPLOAD DEBUG] Upload Error Analysis:');
                        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.error('🔍 ERROR TYPE:', errorType.toUpperCase());
                        console.error('📋 DIAGNOSIS:', diagnosis);
                        console.error('');
                        console.error('📥 ERROR DETAILS:');
                        console.error('  Message:', errorInfo.message);
                        console.error('  Code:', errorInfo.code || 'N/A');
                        console.error('  Type:', errorType);
                        if (errorInfo.response) {
                          console.error('  Response Status:', errorInfo.response.status);
                          console.error('  Response Data:', JSON.stringify(errorInfo.response.data, null, 2));
                        }
                        if (errorInfo.allErrors) {
                          console.error('');
                          console.error('📊 ALL METHOD ERRORS:');
                          if (errorInfo.allErrors.axios) {
                            console.error('  Axios:', JSON.stringify(errorInfo.allErrors.axios, null, 2));
                          }
                          if (errorInfo.allErrors.xhr) {
                            console.error('  XHR:', JSON.stringify(errorInfo.allErrors.xhr, null, 2));
                          }
                          if (errorInfo.allErrors.fetch) {
                            console.error('  Fetch:', JSON.stringify(errorInfo.allErrors.fetch, null, 2));
                          }
                        }
                        console.error('  Duration:', `${duration}ms`);
                        console.error('  Timestamp:', errorInfo.timestamp);
                        console.error('');
                        console.error('💡 RECOMMENDATIONS:');
                        if (errorType === 'network') {
                          console.error('  1. Check if Heroku app is running');
                          console.error('  2. Verify API URL is correct');
                          console.error('  3. Check internet connection');
                          console.error('  4. Try again (app may be waking up)');
                        } else if (errorType === 'formdata') {
                          console.error('  1. Code will automatically try axios method');
                          console.error('  2. If still fails, check FormData format');
                        } else if (errorType === 'ssl') {
                          console.error('  1. Check network security config');
                          console.error('  2. Verify SSL certificate is valid');
                        } else if (errorType === 'timeout') {
                          console.error('  1. File may be too large');
                          console.error('  2. Try with smaller file');
                          console.error('  3. Check server response time');
                        }
                        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                      },
                    }
                  );
                }}
                disabled={uploadFileMutation.isPending || !selectedFile}
                style={styles.uploadButton}
              />
            )}

            {/* Debug Info UI */}
            {uploadDebugInfo.status !== 'idle' && (
              <View
                style={[
                  styles.debugContainer,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor:
                      uploadDebugInfo.status === 'success'
                        ? theme === 'dark' ? '#22c55e' : '#16a34a'
                        : uploadDebugInfo.status === 'error'
                          ? theme === 'dark' ? '#ef4444' : '#dc2626'
                          : themeColors.border,
                  },
                ]}
              >
                <View style={styles.debugHeader}>
                  <Text
                    style={[
                      styles.debugTitle,
                      { color: themeColors.foreground },
                    ]}
                  >
                    API Debug Info
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          uploadDebugInfo.status === 'success'
                            ? theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)'
                            : uploadDebugInfo.status === 'error'
                              ? theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'
                              : theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            uploadDebugInfo.status === 'success'
                              ? theme === 'dark' ? '#86efac' : '#16a34a'
                              : uploadDebugInfo.status === 'error'
                                ? theme === 'dark' ? '#fca5a5' : '#dc2626'
                                : theme === 'dark' ? '#7dd3fc' : '#0284c7',
                        },
                      ]}
                    >
                      {uploadDebugInfo.status === 'uploading' ? 'Uploading...' : uploadDebugInfo.status === 'success' ? 'Success' : 'Error'}
                    </Text>
                  </View>
                </View>

                {uploadDebugInfo.completeInput && (
                  <View style={styles.debugSection}>
                    <Text
                      style={[
                        styles.debugSectionTitle,
                        { color: themeColors.foreground },
                      ]}
                    >
                      📋 Complete JSON Input (For API Team)
                    </Text>
                    <View
                      style={[
                        styles.debugDataContainer,
                        {
                          backgroundColor:
                            theme === 'dark'
                              ? 'rgba(0, 0, 0, 0.2)'
                              : 'rgba(0, 0, 0, 0.05)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.debugDataText,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {JSON.stringify(uploadDebugInfo.completeInput, null, 2)}
                      </Text>
                    </View>
                  </View>
                )}

                {uploadDebugInfo.request && (
                  <View style={styles.debugSection}>
                    <Text
                      style={[
                        styles.debugSectionTitle,
                        { color: themeColors.foreground },
                      ]}
                    >
                      📤 Request
                    </Text>
                    <View style={styles.debugRow}>
                      <Text
                        style={[
                          styles.debugLabel,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        URL:
                      </Text>
                      <Text
                        style={[
                          styles.debugValue,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {uploadDebugInfo.request.url}
                      </Text>
                    </View>
                    <View style={styles.debugRow}>
                      <Text
                        style={[
                          styles.debugLabel,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        Method:
                      </Text>
                      <Text
                        style={[
                          styles.debugValue,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {uploadDebugInfo.request.method}
                      </Text>
                    </View>
                    <View style={styles.debugRow}>
                      <Text
                        style={[
                          styles.debugLabel,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        Timestamp:
                      </Text>
                      <Text
                        style={[
                          styles.debugValue,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {new Date(uploadDebugInfo.request.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                )}

                {uploadDebugInfo.response && (
                  <View style={styles.debugSection}>
                    <Text
                      style={[
                        styles.debugSectionTitle,
                        { color: themeColors.foreground },
                      ]}
                    >
                      📥 Response
                    </Text>
                    <View style={styles.debugRow}>
                      <Text
                        style={[
                          styles.debugLabel,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        Status:
                      </Text>
                      <Text
                        style={[
                          styles.debugValue,
                          {
                            color:
                              uploadDebugInfo.response.status >= 200 && uploadDebugInfo.response.status < 300
                                ? theme === 'dark' ? '#86efac' : '#16a34a'
                                : theme === 'dark' ? '#fca5a5' : '#dc2626',
                          },
                        ]}
                      >
                        {uploadDebugInfo.response.status} {uploadDebugInfo.response.statusText}
                      </Text>
                    </View>
                    {uploadDebugInfo.duration && (
                      <View style={styles.debugRow}>
                        <Text
                          style={[
                            styles.debugLabel,
                            { color: themeColors['muted-foreground'] },
                          ]}
                        >
                          Duration:
                        </Text>
                        <Text
                          style={[
                            styles.debugValue,
                            { color: themeColors.foreground },
                          ]}
                        >
                          {uploadDebugInfo.duration}ms
                        </Text>
                      </View>
                    )}
                    {uploadDebugInfo.response.data && (
                      <View
                        style={[
                          styles.debugDataContainer,
                          {
                            backgroundColor:
                              theme === 'dark'
                                ? 'rgba(0, 0, 0, 0.2)'
                                : 'rgba(0, 0, 0, 0.05)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.debugLabel,
                            { color: themeColors['muted-foreground'], marginBottom: spacing.xs },
                          ]}
                        >
                          Data:
                        </Text>
                        <Text
                          style={[
                            styles.debugDataText,
                            { color: themeColors.foreground },
                          ]}
                        >
                          {JSON.stringify(uploadDebugInfo.response.data, null, 2)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {uploadDebugInfo.usedMethod && (
                  <View style={styles.debugSection}>
                    <Text
                      style={[
                        styles.debugSectionTitle,
                        { color: themeColors.foreground },
                      ]}
                    >
                      🔧 Method Used
                    </Text>
                    <View style={styles.debugRow}>
                      <Text
                        style={[
                          styles.debugLabel,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        Method:
                      </Text>
                      <Text
                        style={[
                          styles.debugValue,
                          { 
                            color: uploadDebugInfo.status === 'success'
                              ? theme === 'dark' ? '#86efac' : '#16a34a'
                              : themeColors.foreground,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        {uploadDebugInfo.usedMethod.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                )}

                {uploadDebugInfo.error && (
                  <View style={styles.debugSection}>
                    <Text
                      style={[
                        styles.debugSectionTitle,
                        { color: themeColors.foreground },
                      ]}
                    >
                      ❌ Error Analysis
                    </Text>
                    
                    {uploadDebugInfo.error.type && (
                      <View
                        style={[
                          styles.errorTypeBadge,
                          {
                            backgroundColor:
                              uploadDebugInfo.error.type === 'network'
                                ? theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'
                                : uploadDebugInfo.error.type === 'timeout'
                                  ? theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)'
                                  : uploadDebugInfo.error.type === 'ssl'
                                    ? theme === 'dark' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)'
                                    : uploadDebugInfo.error.type === 'formdata'
                                      ? theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                                      : theme === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.errorTypeText,
                            {
                              color:
                                uploadDebugInfo.error.type === 'network'
                                  ? theme === 'dark' ? '#fca5a5' : '#dc2626'
                                  : uploadDebugInfo.error.type === 'timeout'
                                    ? theme === 'dark' ? '#fde047' : '#d97706'
                                    : uploadDebugInfo.error.type === 'ssl'
                                      ? theme === 'dark' ? '#c4b5fd' : '#7c3aed'
                                      : uploadDebugInfo.error.type === 'formdata'
                                        ? theme === 'dark' ? '#7dd3fc' : '#0284c7'
                                        : themeColors['muted-foreground'],
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {uploadDebugInfo.error.type.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    
                    {uploadDebugInfo.error.diagnosis && (
                      <View
                        style={[
                          styles.diagnosisContainer,
                          {
                            backgroundColor:
                              theme === 'dark'
                                ? 'rgba(0, 0, 0, 0.2)'
                                : 'rgba(0, 0, 0, 0.05)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.diagnosisLabel,
                            { color: themeColors['muted-foreground'] },
                          ]}
                        >
                          💡 Diagnosis:
                        </Text>
                        <Text
                          style={[
                            styles.diagnosisText,
                            { color: themeColors.foreground },
                          ]}
                        >
                          {uploadDebugInfo.error.diagnosis}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.debugRow}>
                      <Text
                        style={[
                          styles.debugLabel,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        Message:
                      </Text>
                      <Text
                        style={[
                          styles.debugValue,
                          { color: theme === 'dark' ? '#fca5a5' : '#dc2626' },
                        ]}
                      >
                        {uploadDebugInfo.error.message}
                      </Text>
                    </View>
                    {uploadDebugInfo.error.code && (
                      <View style={styles.debugRow}>
                        <Text
                          style={[
                            styles.debugLabel,
                            { color: themeColors['muted-foreground'] },
                          ]}
                        >
                          Code:
                        </Text>
                        <Text
                          style={[
                            styles.debugValue,
                            { color: themeColors.foreground },
                          ]}
                        >
                          {uploadDebugInfo.error.code}
                        </Text>
                      </View>
                    )}
                    {uploadDebugInfo.error.response && (
                      <View style={styles.debugRow}>
                        <Text
                          style={[
                            styles.debugLabel,
                            { color: themeColors['muted-foreground'] },
                          ]}
                        >
                          Response Status:
                        </Text>
                        <Text
                          style={[
                            styles.debugValue,
                            { color: theme === 'dark' ? '#fca5a5' : '#dc2626' },
                          ]}
                        >
                          {uploadDebugInfo.error.response.status}
                        </Text>
                      </View>
                    )}
                    {uploadDebugInfo.duration && (
                      <View style={styles.debugRow}>
                        <Text
                          style={[
                            styles.debugLabel,
                            { color: themeColors['muted-foreground'] },
                          ]}
                        >
                          Duration:
                        </Text>
                        <Text
                          style={[
                            styles.debugValue,
                            { color: themeColors.foreground },
                          ]}
                        >
                          {uploadDebugInfo.duration}ms
                        </Text>
                      </View>
                    )}
                    
                    {uploadDebugInfo.error.allErrors && (
                      <View style={styles.debugSection}>
                        <Text
                          style={[
                            styles.debugSectionTitle,
                            { color: themeColors.foreground, fontSize: typography.fontSize.xs },
                          ]}
                        >
                          📊 All Method Errors
                        </Text>
                        {uploadDebugInfo.error.allErrors.axios && (
                          <View
                            style={[
                              styles.debugDataContainer,
                              {
                                backgroundColor:
                                  theme === 'dark'
                                    ? 'rgba(0, 0, 0, 0.2)'
                                    : 'rgba(0, 0, 0, 0.05)',
                                marginTop: spacing.xs,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.debugLabel,
                                { color: themeColors['muted-foreground'], marginBottom: spacing.xs },
                              ]}
                            >
                              Axios:
                            </Text>
                            <Text
                              style={[
                                styles.debugDataText,
                                { color: themeColors.foreground },
                              ]}
                            >
                              {JSON.stringify(uploadDebugInfo.error.allErrors.axios, null, 2)}
                            </Text>
                          </View>
                        )}
                        {uploadDebugInfo.error.allErrors.xhr && (
                          <View
                            style={[
                              styles.debugDataContainer,
                              {
                                backgroundColor:
                                  theme === 'dark'
                                    ? 'rgba(0, 0, 0, 0.2)'
                                    : 'rgba(0, 0, 0, 0.05)',
                                marginTop: spacing.xs,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.debugLabel,
                                { color: themeColors['muted-foreground'], marginBottom: spacing.xs },
                              ]}
                            >
                              XHR:
                            </Text>
                            <Text
                              style={[
                                styles.debugDataText,
                                { color: themeColors.foreground },
                              ]}
                            >
                              {JSON.stringify(uploadDebugInfo.error.allErrors.xhr, null, 2)}
                            </Text>
                          </View>
                        )}
                        {uploadDebugInfo.error.allErrors.fetch && (
                          <View
                            style={[
                              styles.debugDataContainer,
                              {
                                backgroundColor:
                                  theme === 'dark'
                                    ? 'rgba(0, 0, 0, 0.2)'
                                    : 'rgba(0, 0, 0, 0.05)',
                                marginTop: spacing.xs,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.debugLabel,
                                { color: themeColors['muted-foreground'], marginBottom: spacing.xs },
                              ]}
                            >
                              Fetch:
                            </Text>
                            <Text
                              style={[
                                styles.debugDataText,
                                { color: themeColors.foreground },
                              ]}
                            >
                              {JSON.stringify(uploadDebugInfo.error.allErrors.fetch, null, 2)}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </CardContent>
        </Card>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.settings.about.title')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TouchableOpacity
              style={styles.aboutItem}
              onPress={() => {
                const newCount = versionTapCount + 1;
                setVersionTapCount(newCount);
                if (newCount >= 5) {
                  setVersionTapCount(0);
                  navigation.navigate('DevTools' as never);
                }
              }}
            >
              <Text
                style={[
                  styles.aboutLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.settings.about.version')}
              </Text>
              <Text
                style={[
                  styles.aboutValue,
                  { color: themeColors.foreground },
                ]}
              >
                1.0.0
              </Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        <Button
          title={t('student.profile.logOut')}
          onPress={async () => {
            const { logout } = useAuthStore.getState();
            const { setMockMode } = useMockModeStore.getState();
            const { clearProgress } = usePrintProgressStore.getState();
            
            // Clear print progress on logout
            await clearProgress();
            
            logout();
            setMockMode(false);
            setTimeout(() => {
              if (navigationRef.isReady()) {
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }, 100);
          }}
          variant="destructive"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  aboutLabel: {
    fontSize: typography.fontSize.sm,
  },
  aboutValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  themeSelect: {
    marginTop: spacing.sm,
  },
  languageSelect: {
    marginTop: spacing.sm,
  },
  roleSelect: {
    marginTop: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  testUploadButton: {
    marginTop: spacing.sm,
  },
  fileInfoContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  fileInfoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  fileInfoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    flexShrink: 0,
  },
  fileInfoValue: {
    fontSize: typography.fontSize.sm,
    flex: 1,
    textAlign: 'right',
  },
  uploadButton: {
    marginTop: spacing.md,
  },
  debugContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    gap: spacing.md,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  debugTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  debugSection: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  debugSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  debugLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    flexShrink: 0,
  },
  debugValue: {
    fontSize: typography.fontSize.xs,
    flex: 1,
    textAlign: 'right',
  },
  debugDataContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  debugDataText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
  },
  errorTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  errorTypeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  diagnosisContainer: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  diagnosisLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  diagnosisText: {
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },
});
