<template>
  <div class="content-header">
    <h3>Lorem Ipsum</h3>
    <div class="content-text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras iaculis lobortis dui vel
      blandit. Morbi euismod,
      <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">nulla feugiat</a> fermentum
      accumsan, lacus nunc rutrum risus, sed ullamcorper tellus erat eget ligula. Nam eget hendrerit
      urna. <br /><br />
      Praesent imperdiet pretium metus, id bibendum felis tempor ut. Suspendisse luctus nisl a ipsum
      maximus volutpat. Pellentesque mattis dolor leo, id consequat sapien dapibus et. Vivamus et
      sapien tempor lorem faucibus tincidunt ut maximus lectus. Fusce tristique nisl at sapien
      vehicula, et lacinia ipsum tempor. Phasellus sagittis purus elementum odio mollis, in aliquet
      ante porta. <br /><br />
      Cras id diam condimentum, auctor ipsum eget, volutpat justo.
      <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Vivamus</a> dui libero,
      rhoncus sit amet velit sed, fringilla mollis arcu. Quisque ut sem pretium, consectetur purus
      at, pellentesque nisi. Curabitur neque ante, dapibus nec enim ut, dictum interdum urna. Sed
      posuere, libero vitae euismod pellentesque, tortor eros convallis elit, quis molestie est
      felis id magna.
      <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Quisque</a> scelerisque orci
      sapien, vel gravida quam vehicula nec. Aliquam quis quam blandit, porttitor turpis et, dictum
      magna. Maecenas porttitor, mi mattis venenatis consectetur, sapien nibh accumsan dolor, non
      bibendum turpis turpis id ipsum. Quisque tellus lorem, ultricies nec consequat et, tristique
      non diam. Proin elementum dictum nisl, in porttitor risus eleifend et. Donec vulputate finibus
      dui vitae ornare. Praesent blandit facilisis mi vitae egestas.
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/colors';

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: $sneasel-feather;
}

.content-header,
.content-text {
  text-align: center;
}
@media (min-width: $desktop) {
  .content-header,
  .content-text {
    text-align: left;
  }
}
</style>
