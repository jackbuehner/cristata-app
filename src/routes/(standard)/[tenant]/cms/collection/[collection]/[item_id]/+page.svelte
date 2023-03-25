<script lang="ts">
  import { CollectionItemPage } from '$react/CMS/CollectionItemPage';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<react:CollectionItemPage {data} />
