# deploy-certificate-to-aliyun

每两个月自动上传泛解析证书到阿里云证书管理上

## 如何使用

fork该项目，并填写对应参数，再push一次代码即可（随便改点啥，workflow需要push才能触发）

 GitHub 仓库的 "Settings" -> "Secrets and variables" -> "Actions" 中添加以下 secrets：

- `ALIYUN_ACCESS_KEY_ID`：阿里云账户AK
- `ALIYUN_ACCESS_KEY_SECRET`：阿里云账户SK
- `DOMAIN`: 要设置域名的二级域名，例如要设置*.example.com，这里填写的就是example.com
- `ALIYUN_CDN_DOMAIN`：设置阿里云cdn域名，一般是三级域名，例如cdn.example.com，需要跟上面的DOMAIN对应，否则会设置错误
- `BUCKET`:  OSS存储桶
- `EMAIL`:  证书过期时提醒的邮件

目前在使用的域名在DNSPOD下，acme需使用dns_tencent模式和腾讯云认证信息, 有需求可以在action.yml中替换

- `TENCENT_SECRET_ID`：腾讯云账户AK
- `TENCENT_SECRET_KEY`：腾讯云账户SK

```yml
    - name: Obtain SSL Certificates
      env:
        DOMAIN: ${{ secrets.DOMAIN }}
        Tencent_SecretId: ${{ secrets.TENCENT_SECRET_ID }}
        Tencent_SecretKey: ${{ secrets.TENCENT_SECRET_KEY }}
        Ali_Key: ${{ secrets.ALIYUN_ACCESS_KEY_ID }}
        Ali_Secret: ${{ secrets.ALIYUN_ACCESS_KEY_SECRET }}
      run: |
        ~/.acme.sh/acme.sh --issue --dns dns_tencent -d "*.${DOMAIN}" \
        --key-file ~/certs/${domain}/privkey.pem --fullchain-file ~/certs/${domain}/fullchain.pem
```

## 相关文档

> 这里使用的是阿里云提供的api进行的调用
>
> - 上传证书: <https://next.api.aliyun.com/api/cas/2020-04-07/UploadUserCertificate>
> 上传CNAME 接口只支持java的sdk 但我们可以用ossutil putCname
> JDK <https://api.aliyun.com/api/Oss/2019-05-17/PutCname?sdkStyle=dara>
> OSSUTIL <https://www.alibabacloud.com/help/zh/oss/developer-reference/put-cname>
> 阿里云文档啥也没写清，源码里有详细的使用方法 <https://github.com/aliyun/ossutil/blob/master/lib/bucket_cname.go>
