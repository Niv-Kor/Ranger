<template>
    <div>
        <v-row no-gutters>
            <v-col>
                <v-card
                    class='outer-card'
                    :width='windowDim.width * .93'
                    elevation=0
                >
                    <v-card
                        class='inner-card'
                        :width='windowDim.width * .93'
                        :min-height='windowDim.height - 187'
                        elevation=0
                    >
                        <!-- username -->
                        <hr class='horizontal-line first-line'>
                        <p
                            class='subtitle'
                            align=left
                            :style='headerStyle'
                        >
                            <span class='subtitle-header'>Name</span>
                            <span class='change-icon'>
                                <v-btn
                                    small
                                    text
                                    :color='changeUsername ? colors.primary : colors.neutral'
                                    @click='revertSegment(0, changeUsername)'
                                >
                                    {{ changeUsername ? 'revert' : 'change' }}
                                </v-btn>
                            </span>
                        </p>
                        <p
                            v-if='!changeUsername'
                            align=center
                        >
                            {{ newName }}
                        </p>
                        <v-text-field
                            v-else
                            v-model='newName'
                            class='field username'
                            height=30
                            dense
                            counter=25
                            clearable
                            :rules='[inputRules.validUsername]'
                            :color='colors.neutral'
                        />
                        <!-- email -->
                        <hr class='horizontal-line'>
                        <p
                            class='subtitle'
                            align=left
                            :style='headerStyle'
                        >
                            <span class='subtitle-header'>E-mail Address</span>
                            <span class='change-icon'>
                                <v-btn
                                    small
                                    text
                                    :color='changeEmail ? colors.primary : colors.neutral'
                                    @click='revertSegment(1, changeEmail)'
                                >
                                    {{ changeEmail ? 'revert' : 'change' }}
                                </v-btn>
                            </span>
                        </p>
                        <p
                            v-if='!changeEmail'
                            align=center
                        >
                            {{ newEmail }}
                        </p>
                        <v-text-field
                            v-else
                            v-model='newEmail'
                            class='field email'
                            height=30
                            dense
                            counter=70
                            clearable
                            :rules='[inputRules.validEmail]'
                            :color='colors.neutral'
                        />
                        <!-- password -->
                        <hr class='horizontal-line'>
                        <p
                            class='subtitle'
                            align=left
                            :style='headerStyle'
                        >
                            <span class='subtitle-header'>Password</span>
                            <span class='change-icon'>
                                <v-btn
                                    small
                                    text
                                    :color='changePassword ? colors.primary : colors.neutral'
                                    @click='revertSegment(2, changePassword)'
                                >
                                    {{ changePassword ? 'revert' : 'change' }}
                                </v-btn>
                            </span>
                        </p>
                        <p
                            v-if='!changePassword'
                            align=center
                        >
                            <span class='hidden-pass bracket'>&lt;</span>
                            <span class='hidden-pass'> hidden </span>
                            <span class='hidden-pass bracket'>&gt;</span>
                        </p>
                        <div v-else>
                            <v-text-field
                                v-model='oldPassword'
                                type='password'
                                class='field username'
                                height=30
                                dense
                                clearable
                                placeholder='old password'
                                :color='colors.neutral'
                            />
                            <v-text-field
                                v-model='newPassword'
                                type='password'
                                class='field username'
                                height=30
                                dense
                                counter=40
                                clearable
                                placeholder='new password'
                                :rules='[inputRules.validPassword]'
                                :color='colors.neutral'
                            />
                            <v-text-field
                                v-model='repeatPassword'
                                type='password'
                                class='field username'
                                height=30
                                dense
                                counter=40
                                clearable
                                placeholder='repeat new password'
                                :color='colors.neutral'
                            />
                        </div>
                    </v-card>
                    <!-- save -->
                    <hr class='horizontal-line last-line'>
                    <v-btn
                        class='btn revert'
                        outlined
                        :color='colors.primary'
                        @click='revertAll'
                    >
                        Revert
                    </v-btn>
                    <v-btn
                        class='btn save'
                        outlined
                        :color='colors.primary'
                        @click='save'
                    >
                        Save
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
        <warning-dialog
            :model='warningModel'
            :message='warningMessage'
            :callback='warningCallback'
            async-wait
            irreversible
            @close='warningModel = false'
        />
        <v-dialog
            v-model='dialogModel'
            :max-width=290
        >
            <v-card>
                <v-card-title
                    class='dialog-title'
                    :style="{ backgroundColor: dialogColor }"
                >
                    <p
                        class='dialog-title-flex success-dialog'
                        align=center
                    >
                        {{ dialogMessage }}
                    </p>
                </v-card-title>
                <v-card-actions>
                    <v-btn
                        class='dialog-btn ok-btn success-dialog'
                        text
                        block
                        :color='colors.primaryDark'
                        @click='onDialogClick'
                    >
                        Ok
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <loading :model='load' />
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import { windowDimMixin } from '../../../util/Mixins'
    import Loading from '../../widgets/Loading';
    import ColorsHandler from '../../../util/ColorsHandler';
    import WarningDialog from '../../widgets/WarningDialog';

    export default {
        mixins: [
            windowDimMixin
        ],
        components: {
            WarningDialog,
            Loading
        },
        data() {
            return {
                load: false,
                warningModel: false,
                warningMessage: '',
                warningCallback: null,
                dialogModel: false,
                dialogMessage: '',
                dialogColor: '',
                dialogSuccessful: false,
                newName: '',
                newEmail: '',
                oldPassword: '',
                newPassword: '',
                repeatPassword: '',
                changeEmail: false,
                changeUsername: false,
                changePassword: false,
                templateColor: ColorsHandler.darken('#fafafa', 40),
                inputRules: {
                    validUsername: value => this.regex.username.test(value) || 'Not a valid name',
                    validEmail: value => this.regex.email.test(value) || 'Not a valid email address',
                    validPassword: value => this.regex.password.test(value) || 'Must be 8-25 characters'
                }
            }
        },
        computed: {
            ...mapGetters({
                colors: 'getColors',
                userData: 'getUserData',
                regex: 'getAuthRegex'
            }),
            headerStyle() {
                let gradient = `linear-gradient(to right, ${this.templateColor}50, #00000000)`
                return { backgroundImage: gradient };
            }
        },
        watch: {
            newName(value) {
                this.$store.commit('setAccountNewUsername', value);
            },
            newEmail(value) {
                this.$store.commit('setAccountNewEmail', value);
            },
            newPassword(value) {
                this.$store.commit('setAccountNewPassowrd', value);
            }
        },
        created() {
            this.revertAll();
        },
        methods: {
            /**
             * Create a style for the little light bulb in every segment.
             * 
             * @param {Number} segment - Segment index:
             *                           0 - name
             *                           1 - discipline
             *                           2 - default target
             *                           3 - color theme
             * @returns {Object} {
             *                      {String} color - The color of the light bulb,
             *                      {String} filter - CSS filter attribute (drop-shadow)
             *                   }
             */
            createSegmentStyle: function(segment) {
                let changed = this.isSegmentChanged(segment);
                let color = changed ? this.colors.primary : this.colors.neutral;

                return { color };
            },
            /**
             * Check if a particular segment of the form has been changed.
             * 
             * @param {Number} segment - Segment index:
             *                           0 - name
             *                           1 - email
             *                           2 - password
             * @returns {Boolean} True if the segment has been changed.
             */
            isSegmentChanged: function(segment) {
                switch (segment) {
                    case 0: return this.newName !== this.userData.username;
                    case 1: return this.newEmail !== this.userData.email;
                    case 2: return this.oldPassword || this.newPassword || this.repeatPassword;
                    default: return false;
                }
            },
            /**
             * Check if a particular change in a segment of the form is valid.
             * 
             * @param {Number} segment - Segment index:
             *                           0 - name
             *                           1 - email
             *                           2 - password
             * @returns {Boolean} True if the segment has valid input.
             */
            isSegmentValid: function(segment) {
                //already displaying a potential message dialog
                if (this.dialogModel) return false;

                switch (segment) {
                    case 0: {
                        if (!this.changeUsername || this.regex.username.test(this.newName)) return true;
                        else {
                            this.popDialog(false, '', 'Name field is not valid.');
                            return false;
                        }
                    }
                    case 1: {
                        if (!this.changeEmail || this.regex.email.test(this.newEmail)) return true;
                        else {
                            this.popDialog(false, '', 'Email field is not valid.');
                            return false;
                        }
                    }
                    case 2: {
                        if (this.changePassword) {
                            let regexTest = this.regex.password.test(this.newPassword);
                            let oldMatch = this.oldPassword === this.userData.password;
                            let newMatch = this.newPassword === this.repeatPassword;

                            if (!oldMatch) {
                                this.popDialog(false, '', 'Old password is incorrect.');
                                return false;
                            }
                            else if (!regexTest) {
                                this.popDialog(false, '', 'New password is invalid.');
                                return false;
                            }
                            else if (!newMatch) {
                                this.popDialog(false, '', 'Repeated passwords does not match.');
                                return false;
                            }
                            //all valid
                            else return true;
                        }
                        //not changed
                        else return true;
                    }
                    //not exist
                    default: return true;
                }
            },
            /**
             * Return a particular segment's values to their default states.
             * 
             * @param {Number} segment - Segment index:
             *                           0 - name
             *                           1 - email
             *                           2 - password
             * @param {Boolean} flag - True to revert the segment or false to open it for changes
             */
            revertSegment: function(segment, flag) {
                switch (segment) {
                    case 0:
                        if (flag) this.newName = this.userData.username;
                        this.changeUsername = !flag;
                        break;
                    case 1:
                        if (flag) this.newEmail = this.userData.email;
                        this.changeEmail = !flag;
                        break;
                    case 2:
                        if (flag) {
                            this.oldPassword = '';
                            this.newPassword = '';
                            this.repeatPassword = '';
                        }
                        this.changePassword = !flag;
                        break;
                }
            },
            /**
             * Return all values in the form to their default states.
             */
            revertAll: function() {
                for (let i = 0; i < 3; i++) this.revertSegment(i, true);
                this.$store.dispatch('initAccountValues');
            },
            /**
             * Save the changed data.
             */
            save: async function() {
                let name = this.isSegmentChanged(0) && this.isSegmentValid(0) ? this.newName : null;
                let email = this.isSegmentChanged(1) && this.isSegmentValid(1) ? this.newEmail : null;
                let password = this.isSegmentChanged(2) && this.isSegmentValid(2) ? this.newPassword : null;

                //nothing is changed
                if (!name && !email && !password) return;

                let data = {
                    username: name,
                    email,
                    password
                }

                this.load = true;
                let success = await this.$store.dispatch('updateAccountData', data);
                this.load = false;
                this.popDialog(success, 'All changes are saved.', 'Could not save changes. Please try again.');
            },
            /**
             * Pop a warning dialog on the screen.
             * 
             * @param {String} msg - The message to display
             * @param {Function} agreementCallback - The function to call if the user click the ok button
             */
            popWarning: function(msg, agreementCallback) {
                this.warningMessage = msg;
                this.warningCallback = agreementCallback;
                this.warningModel = true;
            },
            /**
             * Pop a success/failute dialog on the screen.
             * 
             * @param {Boolean} isSuccessful - True if the process that triggered the dialog is successful
             * @param {String} msg - The message to display
             */
            popDialog: function(isSuccessful, successMsg, failureMsg) {
                this.dialogColor = isSuccessful ? this.colors.secondary : this.colors.primary;
                this.dialogMessage = isSuccessful ? successMsg : failureMsg;
                this.dialogSuccessful = isSuccessful;
                this.dialogModel = true;
            },
            /**
             * Activate when clicking the dialog's 'ok' button.
             * If the dialog shows a successful message, reload all app data.
             */
            onDialogClick: async function() {
                if (this.dialogSuccessful) {
                    this.load = true;
                    await this.$store.dispatch('reloadAllData');
                    this.load = false;
                    this.revertAll();
                }
                this.dialogModel = false;
            },
        }
    }
</script>

<style scoped>
    .outer-card {
        border-width: 1px;
        border-style: dashed none;
    }
    .inner-card {
        top: -40px;
    }
    .subtitle {
        height: 50px;
        line-height: 50px;
        font-size: 18px;
        letter-spacing: 2.5px;
    }
    .subtitle-header {
        margin-left: 20px;
    }
    .hidden-pass.bracket {
        color: #00000040;
    }
    .hidden-pass {
        letter-spacing: 1.5px;
        color: #00000070;
    }
    .change-icon {
        position: absolute;
        right: 10px;
    }
    .field {
        width: 80%;
        margin-left: 10%;
    }
    .horizontal-line {
        margin: 20px 0 -1px 0;
        border-style: inset;
    }
    .horizontal-line.first-line {
        margin-top: 0;
    }
    .horizontal-line.last-line {
        margin: 20px 0 10px 0;
        border-width: .5px;
        border-style: dashed;
        border-color: #00000030;
    }
    .label-target >>> input::placeholder {
        text-align: center;
    }
    .nav-arrow {
        margin: auto;
    }
    .target-thumbnail {
        margin: auto;
    }
    .option-card {
        width: 90%;
        margin: auto;
    }
    .btn-icon {
        margin: 0 8px 0 -13px;
    }
    .btn-info {
        font-size: 14px;
    }
    .btn {
        text-transform: none;
    }
    .btn.save {
        position: absolute;
        right: 0;
    }
    .dialog-title-flex {
        word-break: normal;
        color: #ffffff;
        margin-top: 10px;
    }
    .dialog-title-flex.success-dialog {
        font-weight: bold;
        font-size: 24px;
    }
</style>