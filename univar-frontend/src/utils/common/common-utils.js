import store from '@/store/store.js'

export async function downloadFile(type) {
  let fileResult

  switch (type) {
    case 'ped':
      fileResult = await store.getters.getApiService.getPEDExampleFile()
      break
    case 'hpo':
      fileResult = await store.getters.getApiService.getHPOExampleFile()
      break
    case 'snp':
      fileResult = await store.getters.getApiService.getSNPExampleFile()
      break
    case 'sv':
      fileResult = await store.getters.getApiService.getSVExampleFile()
      break
  }

  let str = fileResult.headers['content-disposition']
  let filename = str.substring(str.indexOf('"') + 1, str.lastIndexOf('"'))

  const blobData = new Blob([fileResult.data], { type: 'text/plain' })
  const url = URL.createObjectURL(blobData)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}