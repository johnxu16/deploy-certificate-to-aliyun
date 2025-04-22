import {$} from 'zx'
import { parseStringPromise } from 'xml2js'

(async () => {
  const bucket = process.env["BUCKET"]
  const domain = process.env["DOMAIN"]
  const cdn_domain = process.env["ALIYUN_CDN_DOMAIN"]
  const sld_domain = domain.split('.').slice(-2).join('.')
  const sub_domain = cdn_domain.replace(`.${sld_domain}`, '')

  console.log(`domain: ${domain}`)
  console.log(`cdn_domain: ${cdn_domain}`)
  console.log(`sld_domain: ${sld_domain}`)
  console.log(`sub_domain: ${sub_domain}`)

  const createToken = await $`ossutil bucket-cname --method put --item token oss://${bucket} ${domain}`
  if (createToken.exitCode !== 0) {
    console.error(createToken.stderr)
    return
  }

  const cnameTokenRes = await parseStringPromise(createToken.stdout)
  const cnameToken = cnameTokenRes.CnameToken.Token[0]
  const oss_url = `${bucket}.oss-cn-hangzhou.aliyuncs.com.`

  // tencent 
  // https://cloud.tencent.com/document/api/1427/112178
  const addTokenRes = await $`tccli dnspod CreateTXTRecord --cli-unfold-argument --Domain ${sld_domain} --RecordLine 默认 --Value ${cnameToken} --SubDomain _dnsauth.${sub_domain}`
  if (addTokenRes.exitCode !== 0) {
    console.error(addTokenRes.stderr)
    return
  }

  // https://cloud.tencent.com/document/api/1427/56180
  const addCnameRes = await $`tccli dnspod CreateRecord --cli-unfold-argument --Domain ${sld_domain} --RecordType CNAME --RecordLine 默认 --Value ${oss_url} --SubDomain ${sub_domain}`
  if (addCnameRes.exitCode !== 0) {
    console.error(addCnameRes.stderr)
    return
  }

  await $`sleep 120; echo waiting for 2 minutes`

  const putCnameRes = await $`ossutil bucket-cname --method put --item certificate oss://${bucket} ~/certs/${domain}/oss_cname.xml`

  if (putCnameRes.exitCode !== 0) {
    console.error(putCnameRes.stderr)
    return
  }
})()
