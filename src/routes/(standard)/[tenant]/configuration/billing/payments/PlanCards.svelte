<script lang="ts">
  import { Expander } from 'fluent-svelte';
</script>

<article>
  <div class="top">
    <h1>Hobby</h1>
    <p class="price">Free forever</p>
    <p class="price-caption">per period + usage fees</p>
    <p class="desc">Perfect for small projects that require a powerful API</p>
  </div>
  <div class="bottom">
    <ul class="main-list">
      <li>Fully hosted and feature-complete content management system</li>
      <li>Powerful rich text content editor</li>
      <li>Real-time collaborative editing</li>
      <li>Powerful GraphQL API for reading and writing content</li>
      <li>Digital asset management for files and photos</li>
      <li>Work together with unlimted users</li>
      <li>Automate custom logic with webhooks</li>
    </ul>
    <Expander>
      Advanced details
      <svelte:fragment slot="content">
        <ul class="main-list">
          <li>Up to 10,000 API calls per 4-week period (hard limit)</li>
          <li>Up to 1,000 content documents</li>
          <li>Unlimited user roles</li>
          <li>Export your data at any time via the API</li>
          <li>Custom navigation panes</li>
          <li>Customizable dashboard</li>
          <li>Email-based support</li>
        </ul>
      </svelte:fragment>
    </Expander>
  </div>
</article>

<article>
  <div class="top">
    <h1>Professional</h1>
    <p class="price">$219</p>
    <p class="price-caption">per period + usage fees</p>
    <p class="desc">Ideal for skilled teams with large aspirations and dynamic activity</p>
  </div>
  <div class="bottom">
    <ul class="main-list">
      <li>Complete access to custom content queries</li>
      <li>Create updates to content without risk, with content versioning and periodic database backups</li>
      <li>Optimize editorial workflow with access to custom content stages and workflow boards</li>
      <li>Scale as you go with API and storage pricing based on your custom usage</li>
      <li>Best for teams with multiple members</li>
    </ul>
    <Expander>
      Advanced details
      <svelte:fragment slot="content">
        <ul class="main-list">
          <li>Unlimited API calls with pay-as-you-go pricing</li>
          <li>Up to 25,000 content documents</li>
          <li>Version backups of every content document</li>
          <li>Up to 100,000 API calls per 4-week period (hard limit)</li>
          <li>Up to 1,000 content documents</li>
          <li>Unlimited user roles</li>
          <li>Export your data at any time via the API</li>
          <li>Custom navigation panes</li>
          <li>Customizable dashboard</li>
          <li>Fully hosted and feature-complete content management system</li>
          <li>Powerful rich text content editor</li>
          <li>Real-time collaborative editing</li>
          <li>Powerful GraphQL API for reading and writing content</li>
          <li>Digital asset management for files and photos</li>
          <li>Work together with unlimted users</li>
          <li>Automate custom logic with webhooks</li>
          <li>Email and message-based support</li>
        </ul>
      </svelte:fragment>
    </Expander>
  </div>
</article>

<article>
  <div class="top">
    <h1>Premium Professional</h1>
    <p class="price">$329</p>
    <p class="price-caption">per period + usage fees</p>
    <p class="desc">Perfect for teams of all sizes and skills</p>
  </div>
  <div class="bottom">
    <ul class="main-list">
      <li>
        Generate custom previews of your website pages to see what your content will look like once it is
        published
      </li>
      <li>Draft updates to published documents without immediately affecting the published version</li>
      <li>
        Optionally add real-time embedded previews of content – great for editors who need contruct documents
        with the website design in mind
      </li>
      <li>Scale as you go with API and storage pricing based on your custom usage</li>
      <li>Best for teams with multiple members of different levels expertise and activity</li>
    </ul>
    <Expander>
      Advanced details
      <svelte:fragment slot="content">
        <ul class="main-list">
          <li>Unlimited API calls with pay-as-you-go pricing</li>
          <li>Unlimited content documents</li>
          <li>Version backups of every content document</li>
          <li>Unlimited user roles</li>
          <li>Export your data at any time via the API</li>
          <li>Custom navigation panes</li>
          <li>Customizable dashboard</li>
          <li>Fully hosted and feature-complete content management system</li>
          <li>Powerful rich text content editor</li>
          <li>Real-time collaborative editing</li>
          <li>Powerful GraphQL API for reading and writing content</li>
          <li>Digital asset management for files and photos</li>
          <li>Work together with unlimted users</li>
          <li>Automate custom logic with webhooks</li>
          <li>Complete access to custom content queries</li>
          <li>Create updates to content without risk, with content versioning and periodic database backups</li>
          <li>Optimize editorial workflow with access to custom content stages and workflow boards</li>
          <li>Email and message-based support</li>
        </ul>
      </svelte:fragment>
    </Expander>
  </div>
</article>

<style>
  article {
    border: 1px solid var(--fds-card-stroke-default);
    border-radius: var(--fds-control-corner-radius);

    padding: 30px;
    background-color: var(--fds-card-background-secondary);

    font-family: var(--fds-font-family-text);
    font-size: var(--fds-body-font-size);
    font-weight: 400;
    width: 350px;
  }

  h1,
  p {
    margin: 0;
  }

  h1 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    font-weight: 500;
    opacity: 0.8;
  }

  p.price {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  p.price-caption {
    font-size: 14px;
    font-weight: 400;
    margin-top: -14px;
    margin-bottom: 14px;
    opacity: 0.8;
  }

  p.desc {
    font-size: 16px;
    opacity: 0.9;
  }

  ul {
    padding-inline-start: 16px;
    opacity: 0.9;
  }

  ul.main-list {
    font-size: 15px;
  }

  ul.main-list li {
    margin-bottom: 4px;
  }
</style>
