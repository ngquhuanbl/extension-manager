interface Window {
  dialog: {
    showMessageBox(options: MessageBoxOptions): Promise<MessageBoxReturnValue>;
    showMessageBoxSync(options: MessageBoxSyncOptions): number;
    showOpenDialog: (
      options: OpenDialogOptions
    ) => Promise<OpenDialogReturnValue>;
  };
}

interface MessageBoxReturnValue {
  /**
   * The index of the clicked button.
   */
  response: number;
  /**
   * The checked state of the checkbox if `checkboxLabel` was set. Otherwise `false`.
   */
  checkboxChecked: boolean;
}

interface MessageBoxSyncOptions {
  /**
   * Content of the message box.
   */
  message: string;
  /**
   * Can be `"none"`, `"info"`, `"error"`, `"question"` or `"warning"`. On Windows,
   * `"question"` displays the same icon as `"info"`, unless you set an icon using
   * the `"icon"` option. On macOS, both `"warning"` and `"error"` display the same
   * warning icon.
   */
  type?: string;
  /**
   * Array of texts for buttons. On Windows, an empty array will result in one button
   * labeled "OK".
   */
  buttons?: string[];
  /**
   * Index of the button in the buttons array which will be selected by default when
   * the message box opens.
   */
  defaultId?: number;
  /**
   * Title of the message box, some platforms will not show it.
   */
  title?: string;
  /**
   * Extra information of the message.
   */
  detail?: string;
  icon?: (NativeImage) | (string);
  /**
   * Custom width of the text in the message box.
   *
   * @platform darwin
   */
  textWidth?: number;
  /**
   * The index of the button to be used to cancel the dialog, via the `Esc` key. By
   * default this is assigned to the first button with "cancel" or "no" as the label.
   * If no such labeled buttons exist and this option is not set, `0` will be used as
   * the return value.
   */
  cancelId?: number;
  /**
   * On Windows Electron will try to figure out which one of the `buttons` are common
   * buttons (like "Cancel" or "Yes"), and show the others as command links in the
   * dialog. This can make the dialog appear in the style of modern Windows apps. If
   * you don't like this behavior, you can set `noLink` to `true`.
   */
  noLink?: boolean;
  /**
   * Normalize the keyboard access keys across platforms. Default is `false`.
   * Enabling this assumes `&` is used in the button labels for the placement of the
   * keyboard shortcut access key and labels will be converted so they work correctly
   * on each platform, `&` characters are removed on macOS, converted to `_` on
   * Linux, and left untouched on Windows. For example, a button label of `Vie&w`
   * will be converted to `Vie_w` on Linux and `View` on macOS and can be selected
   * via `Alt-W` on Windows and Linux.
   */
  normalizeAccessKeys?: boolean;
}

interface MessageBoxOptions {
  /**
   * Content of the message box.
   */
  message: string;
  /**
   * Can be `"none"`, `"info"`, `"error"`, `"question"` or `"warning"`. On Windows,
   * `"question"` displays the same icon as `"info"`, unless you set an icon using
   * the `"icon"` option. On macOS, both `"warning"` and `"error"` display the same
   * warning icon.
   */
  type?: string;
}

interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  /**
   * Custom label for the confirmation button, when left empty the default label will
   * be used.
   */
  buttonLabel?: string;
  filters?: Array<{
    // Docs: https://electronjs.org/docs/api/structures/file-filter

    extensions: string[];
    name: string;
  }>;
  /**
   * Contains which features the dialog should use. The following values are
   * supported:
   */
  properties?: Array<
    | "openFile"
    | "openDirectory"
    | "multiSelections"
    | "showHiddenFiles"
    | "createDirectory"
    | "promptToCreate"
    | "noResolveAliases"
    | "treatPackageAsDirectory"
    | "dontAddToRecent"
  >;
  /**
   * Message to display above input boxes.
   *
   * @platform darwin
   */
  message?: string;
  /**
   * Create security scoped bookmarks when packaged for the Mac App Store.
   *
   * @platform darwin,mas
   */
  securityScopedBookmarks?: boolean;
}

interface OpenDialogReturnValue {
  /**
   * whether or not the dialog was canceled.
   */
  canceled: boolean;
  /**
   * An array of file paths chosen by the user. If the dialog is cancelled this will
   * be an empty array.
   */
  filePaths: string[];
  /**
   * An array matching the `filePaths` array of base64 encoded strings which contains
   * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
   * this to be populated. (For return values, see table here.)
   *
   * @platform darwin,mas
   */
  bookmarks?: string[];
}
