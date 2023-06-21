<script lang="ts">
  import FluentIcon from '$lib/common/FluentIcon.svelte';
  import { ComboBox, IconButton } from 'fluent-svelte';

  export let visible = false;
</script>

<div class="panel" class:visible>
  <IconButton>
    <FluentIcon name="ArrowUndo20Regular" />
  </IconButton>
  <IconButton>
    <FluentIcon name="ArrowRedo20Regular" />
  </IconButton>

  <span class="bar" />

  <ComboBox editable openOnFocus items={[{ name: 'Georgia', value: 'Georgia' }]} style="width: 160px;" />
  <ComboBox editable openOnFocus items={[{ name: '17px', value: '17px' }]} style="width: 84px;" />

  <IconButton>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
      <path
        d="M1255 901q92 0 173 35t142 95 96 142 35 173q0 92-35 173t-95 142-142 96-174 35H512V128h743q80 0 150 30t122 83 83 123 31 150q0 80-30 150t-82 123-123 83-151 31zm-208-535H896v475h151q49 0 92-19t76-51 51-75 19-93q0-49-19-92t-51-75-75-51-93-19zm59 1188q49 0 92-18t76-51 51-76 19-92q0-49-18-92t-51-76-76-51-93-19H896v475h210z"
      />
    </svg>
  </IconButton>
  <IconButton>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
      <path d="M1568 256h-217L882 1664h366l-128 128H416l128-128h161l469-1408H864l128-128h704l-128 128z" />
    </svg>
  </IconButton>
  <IconButton>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
      <path
        d="M1011 1792q-161 0-274-46t-184-133-105-209-33-275V128h192v988q0 109 21 201t71 159 131 106 201 38q115 0 193-36t127-101 69-154 21-195V128h192v975q0 158-34 285t-109 217-193 138-286 49zm-627 128h1280v128H384v-128z"
      />
    </svg>
  </IconButton>
  <IconButton>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
      <path
        d="M2048 1152v128h-75q-10 100-45 189t-95 158-144 108-192 40q-224 0-336-197h-4v172h-133v-470H896v470H763v-189h-4q-52 101-141 157t-204 57q-70 0-131-19t-106-58-71-96-26-131q0-51 12-100t43-91H0v-128h332q2 0 16-3t33-7 36-8 23-5l323-47q0-61-11-116t-38-98-73-68-116-25q-99 0-185 36T179 911V766q36-25 80-45t91-33 94-21 92-7q96 0 164 28t112 80 64 125 20 164v95h128V173h133v716h4q60-111 158-170t225-59q109 0 189 39t133 107 80 157 31 189h71zM763 1280H314q-57 29-77 76t-20 107q0 49 17 86t48 61 70 37 86 13q54 0 100-15t85-44 67-68 48-89q16-42 20-80t5-84zm394-128h683q-3-73-23-141t-59-120-99-84-142-32q-82 0-147 29t-112 81-72 120-29 147zm678 128h-678v27q0 72 24 136t69 113 105 76 137 28q82 0 142-32t103-85 66-121 32-142z"
      />
    </svg>
  </IconButton>
  <IconButton>
    <FluentIcon name="Code20Regular" />
  </IconButton>

  <span class="bar" />

  <IconButton>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
      <path
        d="M0 1280v-128h128v128H0zm0-384V768h128v128H0zm384 0V768h1664v128H384zM0 512V384h128v128H0zm384-128h1664v128H384V384zm0 896v-128h1664v128H384zM0 1664v-128h128v128H0zm384 0v-128h1664v128H384z"
      />
    </svg>
  </IconButton>
  <IconButton>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
      <path
        d="M2048 384v128H512V384h1536zM512 896h1536v128H512V896zm0 512h1536v128H512v-128zM135 349q-14 11-37 21t-43 11v-69q31-11 59-24t54-33h49v385h-82V349zm-1 420q25 0 47 6t39 20 26 34 10 47q0 31-12 54t-29 42-39 33-38 27-30 25-12 26h160v69H5v-41q0-18 10-39 15-34 41-57t51-44 45-40 19-47q0-27-15-38t-40-11q-26 0-49 11t-44 28v-73q50-32 111-32zm36 699q36 5 61 27t25 61q0 31-12 53t-33 35-46 20-54 7q-24 0-48-4t-47-15v-73q19 14 41 21t47 7q26 0 46-11t21-41q0-22-13-32t-31-15-39-5-34 0v-64h32q18 0 34-3t28-14 12-31q0-26-16-36t-40-10q-39 0-74 24v-68q22-11 45-15t48-5q22 0 44 5t39 16 28 30 11 43q0 38-19 60t-56 32v1z"
      />
    </svg>
  </IconButton>

  <span class="bar" />

  <ComboBox editable openOnFocus items={[{ name: 'Title', value: 'title' }]} style="width: 180px;" />
</div>

<style>
</style>
