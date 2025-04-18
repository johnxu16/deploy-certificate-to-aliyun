import Cas, * as $Cas from '@alicloud/cas20200407';
export default class Client {
    /**
     * createClient  创建客户端
     */
    static createClient(): Promise<Cas>;
    static uploadUserCertificate(client: Cas, name: string, cert: string, key: string, encryptCert: string, encryptPrivateKey: string, signCert: string, signPrivateKey: string): Promise<$Cas.UploadUserCertificateResponse>;
    static deleteUserCertificate(client: Cas, certId: number): Promise<$Cas.DeleteUserCertificateResponse>;
    static getUserCertificateDetail(client: Cas, certId: number): Promise<$Cas.GetUserCertificateDetailResponse>;
    static getFileByPath(): Promise<void>;
    static main(args: string[]): Promise<void>;
}
